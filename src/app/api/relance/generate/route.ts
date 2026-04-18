// POST /api/relance/generate
// Body: { dossierId: string, channel: "email" | "whatsapp" }
// Génère une relance client à partir des documents du dossier

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { generateRelance } from '@/lib/claude/generate';

// UUID regex lenient (accepte v4 + UUID non-versionnés type seed démo)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const BodySchema = z.object({
  dossierId: z.string().regex(UUID_REGEX, 'Invalid UUID format'),
  channel: z.enum(['email', 'whatsapp']),
});

/**
 * Détecte les éléments manquants dans un dossier à partir des documents présents.
 * Logique simple en MVP — à raffiner avec la vraie logique comptable en v1.
 */
function detectMissing(documents: Array<{ type: string | null; metadata: any }>, currentMonth: string): string[] {
  const factures = documents.filter((d) => d.type === 'facture');
  const releves = documents.filter((d) => d.type === 'releve');

  const missing: string[] = [];

  // Check : factures manquantes sur le mois en cours
  const facturesThisMonth = factures.filter((f) => f.metadata?.mois === currentMonth);
  if (facturesThisMonth.length === 0) {
    missing.push(`Factures d'achat du mois en cours (${currentMonth}) — aucune pièce reçue`);
  } else if (facturesThisMonth.length < 5) {
    missing.push(`Factures d'achat complémentaires pour ${currentMonth} (seulement ${facturesThisMonth.length} pièce(s) reçue(s))`);
  }

  // Check : relevé bancaire du mois
  const releveThisMonth = releves.find((r) => r.metadata?.mois === currentMonth);
  if (!releveThisMonth) {
    missing.push(`Relevé bancaire ${currentMonth} (manquant)`);
  }

  // Fallback si rien de spécifique détecté
  if (missing.length === 0) {
    missing.push('Pièces justificatives en attente pour clôturer le dossier du mois');
  }

  return missing;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dossierId, channel } = BodySchema.parse(body);

    const supabase = createAdminClient();

    // 1. Récupérer le dossier
    const { data: dossier, error: dossierError } = await supabase
      .from('dossiers')
      .select('*')
      .eq('id', dossierId)
      .single();

    if (dossierError || !dossier) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
    }

    // 2. Récupérer les documents du dossier
    const { data: documents } = await supabase
      .from('documents')
      .select('type, metadata')
      .eq('dossier_id', dossierId);

    // 3. Détecter ce qui manque
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const missing = detectMissing(documents || [], currentMonth);

    // 4. Appeler Claude pour générer la relance
    const relance = await generateRelance(
      {
        client_name: dossier.client_name,
        regime_fiscal: dossier.regime_fiscal,
        secteur: dossier.secteur,
      },
      missing,
      channel
    );

    // 5. Sauver en draft dans Supabase
    const { data: saved, error: saveError } = await supabase
      .from('relances')
      .insert({
        dossier_id: dossierId,
        reason: missing.join(' | '),
        content_email: channel === 'email' ? relance.body : null,
        content_whatsapp: channel === 'whatsapp' ? relance.body : null,
        email_subject: channel === 'email' ? relance.subject : null,
        status: 'draft',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save relance:', saveError);
      // On retourne quand même la relance générée, même si la sauvegarde a échoué
    }

    return NextResponse.json({
      ...relance,
      id: saved?.id || null,
      missing,
    });
  } catch (error: any) {
    console.error('Relance generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
