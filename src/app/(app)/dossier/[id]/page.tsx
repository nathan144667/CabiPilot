import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

// Force dynamic rendering — la page dépend de Supabase (env vars au runtime)
export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Receipt,
  FileSpreadsheet,
  FileCheck,
  File,
} from "lucide-react";
import { RelanceSection } from "@/components/relance-dialog";
import { QABox } from "@/components/qa-box";

const docTypeIcons: Record<string, React.ElementType> = {
  facture: Receipt,
  releve: FileSpreadsheet,
  fec: FileCheck,
  contrat: FileText,
  devis: FileText,
  autre: File,
};

async function getDossier(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dossiers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

async function getDocuments(dossierId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("documents")
    .select("id, type, filename, uploaded_at, metadata")
    .eq("dossier_id", dossierId)
    .order("uploaded_at", { ascending: false });

  return data ?? [];
}

async function getRelances(dossierId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("relances")
    .select("id, email_subject, status, created_at, content_email, content_whatsapp")
    .eq("dossier_id", dossierId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

async function getQALog(dossierId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("qa_log")
    .select("id, question, answer, sources, created_at")
    .eq("dossier_id", dossierId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMontant(metadata: Record<string, unknown> | null): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const montant = (metadata as { montant_ttc?: number }).montant_ttc;
  if (montant == null) return null;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(montant);
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  validated: { label: "Validée", variant: "secondary" },
  sent: { label: "Envoyée", variant: "default" },
  archived: { label: "Archivée", variant: "outline" },
};

export default async function DossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dossier = await getDossier(id);
  if (!dossier) notFound();

  const [documents, relances, qaLog] = await Promise.all([
    getDocuments(id),
    getRelances(id),
    getQALog(id),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {dossier.client_name}
        </h1>
        {dossier.regime_fiscal && (
          <Badge variant="outline">{dossier.regime_fiscal}</Badge>
        )}
        {dossier.secteur && (
          <Badge variant="secondary">{dossier.secteur}</Badge>
        )}
      </div>

      {/* Documents */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-medium">Documents</h2>
        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucun document dans ce dossier.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y">
              {documents.map((doc) => {
                const Icon = docTypeIcons[doc.type] ?? File;
                const montant = formatMontant(doc.metadata as Record<string, unknown> | null);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} &middot; {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                    {montant && (
                      <span className="text-sm font-medium tabular-nums">
                        {montant}
                      </span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* Relances */}
      <RelanceSection dossierId={id} initialRelances={relances} />

      <Separator />

      {/* Q&A */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-medium">Questions & Réponses</h2>
        <QABox dossierId={id} initialLog={qaLog} />
      </section>
    </div>
  );
}
