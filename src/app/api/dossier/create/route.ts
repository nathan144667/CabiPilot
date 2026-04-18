// POST /api/dossier/create
// multipart/form-data : fec (File, optionnel), plus les champs dossier.
// - Crée le dossier dans la table dossiers (source = 'manual_upload')
// - Si FEC fourni : upload dans le bucket documents + parse + insert fec_lines
// - Associe le dossier au cabinet de l'utilisateur loggé

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { parseFec, type FecSummary } from "@/lib/fec/parse";

export const runtime = "nodejs";

const MAX_FEC_SIZE_MB = 25;

export async function POST(req: Request) {
  // Authentification obligatoire
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Récupère le cabinet du user
  const { data: profile, error: profileErr } = await supabase
    .from("users_profile")
    .select("cabinet_id")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile?.cabinet_id) {
    return NextResponse.json(
      { error: "Profil incomplet — aucun cabinet associé." },
      { status: 400 }
    );
  }

  const cabinetId = profile.cabinet_id as string;

  // Parse multipart
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Payload invalide (multipart attendu)." },
      { status: 400 }
    );
  }

  const client_name = String(formData.get("client_name") || "").trim();
  const client_email = String(formData.get("client_email") || "").trim() || null;
  const client_phone = String(formData.get("client_phone") || "").trim() || null;
  const siret = String(formData.get("siret") || "").trim() || null;
  const regime_fiscal = String(formData.get("regime_fiscal") || "").trim() || null;
  const secteur = String(formData.get("secteur") || "").trim() || null;

  if (!client_name) {
    return NextResponse.json(
      { error: "Le nom du client est obligatoire." },
      { status: 400 }
    );
  }

  // Admin client pour bypass RLS (on est côté server + user déjà validé)
  const admin = createAdminClient();

  // 1) Crée le dossier
  const { data: dossier, error: dossierErr } = await admin
    .from("dossiers")
    .insert({
      cabinet_id: cabinetId,
      client_name,
      client_email,
      client_phone,
      siret,
      regime_fiscal,
      secteur,
      source: "manual_upload",
    })
    .select()
    .single();

  if (dossierErr || !dossier) {
    console.error("dossier insert error:", dossierErr);
    return NextResponse.json(
      { error: dossierErr?.message || "Impossible de créer le dossier." },
      { status: 500 }
    );
  }

  const dossierId = dossier.id as string;

  // 2) Traite le FEC s'il est fourni
  const fecFile = formData.get("fec");
  let fecResult: {
    document_id: string;
    lines_count: number;
    summary: FecSummary;
    warnings: string[];
  } | null = null;

  if (fecFile && fecFile instanceof File && fecFile.size > 0) {
    if (fecFile.size > MAX_FEC_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Fichier FEC trop volumineux (> ${MAX_FEC_SIZE_MB} Mo).`, dossier_id: dossierId },
        { status: 400 }
      );
    }

    // Lit le fichier en texte (win1252 fallback pour les FEC OVH/Sage)
    const buffer = Buffer.from(await fecFile.arrayBuffer());
    let text: string;
    try {
      text = buffer.toString("utf-8");
      // Heuristique : s'il y a des caractères de remplacement typiques (), on retente en latin1
      if (/\uFFFD/.test(text.slice(0, 5000))) {
        text = buffer.toString("latin1");
      }
    } catch {
      text = buffer.toString("latin1");
    }

    const parsed = parseFec(text);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: `FEC invalide : ${parsed.error}`, dossier_id: dossierId },
        { status: 400 }
      );
    }

    // Upload dans Supabase Storage
    const storagePath = `cabinets/${cabinetId}/dossiers/${dossierId}/fec/${Date.now()}-${sanitizeFilename(
      fecFile.name
    )}`;
    const { error: uploadErr } = await admin.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: "text/plain; charset=utf-8",
        upsert: false,
      });

    if (uploadErr) {
      console.error("storage upload error:", uploadErr);
      return NextResponse.json(
        {
          error: `Dossier créé mais upload FEC échoué : ${uploadErr.message}`,
          dossier_id: dossierId,
        },
        { status: 500 }
      );
    }

    // Insert document
    const { data: document, error: docErr } = await admin
      .from("documents")
      .insert({
        dossier_id: dossierId,
        type: "fec",
        filename: fecFile.name,
        storage_path: storagePath,
        metadata: {
          line_count: parsed.lines.length,
          summary: parsed.summary,
          warnings: parsed.warnings,
          source: "manual_upload",
        },
        source: "manual",
      })
      .select()
      .single();

    if (docErr || !document) {
      console.error("document insert error:", docErr);
      return NextResponse.json(
        {
          error: `Dossier créé, FEC uploadé, mais insert document échoué : ${
            docErr?.message ?? "unknown"
          }`,
          dossier_id: dossierId,
        },
        { status: 500 }
      );
    }

    const documentId = document.id as string;

    // Insert lignes FEC par batch de 500
    const BATCH = 500;
    const linesWithRefs = parsed.lines.map((l) => ({
      ...l,
      dossier_id: dossierId,
      document_id: documentId,
    }));

    for (let i = 0; i < linesWithRefs.length; i += BATCH) {
      const batch = linesWithRefs.slice(i, i + BATCH);
      const { error: batchErr } = await admin.from("fec_lines").insert(batch);
      if (batchErr) {
        console.error(`fec_lines batch ${i} error:`, batchErr);
        return NextResponse.json(
          {
            error: `Dossier + FEC créés, mais insert lignes échoué au batch ${i}: ${batchErr.message}`,
            dossier_id: dossierId,
          },
          { status: 500 }
        );
      }
    }

    fecResult = {
      document_id: documentId,
      lines_count: parsed.lines.length,
      summary: parsed.summary,
      warnings: parsed.warnings,
    };
  }

  return NextResponse.json({
    ok: true,
    dossier_id: dossierId,
    dossier,
    fec: fecResult,
  });
}

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}
