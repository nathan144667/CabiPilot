// Calcul du statut métier d'un dossier — v1.5
//
// La v1 se contentait de "pas de relance envoyée depuis 30 jours = en retard", ce
// qui n'a aucun sens pour un EC : pas de relance = tout va bien, c'est ce qu'on
// veut. V1.5 inverse la logique : on détecte des signaux métier concrets.
//
// Critères (classés du pire au meilleur) :
//   🔴 En retard :
//     - Au moins une écriture TVA (44571/44566) sans document de type "facture"
//       rattaché au dossier. Le FEC dit "TVA collectée 500 €" mais aucune facture
//       n'est uploadée pour justifier.
//     - OU la dernière écriture du FEC date de plus de 30 jours.
//   🟡 Attention :
//     - Ratio factures/écritures TVA insuffisant mais pas nul.
//     - OU la dernière écriture date de 15-30 jours.
//   ✅ À jour :
//     - Aucun signal d'alerte.

import { createAdminClient } from "@/lib/supabase/server";

export type DossierStatus = "red" | "orange" | "green";

export type DossierStatusInfo = {
  status: DossierStatus;
  reasons: string[];
  missingDocsCount: number;
  tvaLinesCount: number;
  invoiceDocsCount: number;
  daysSinceLastEntry: number | null;
};

type DossierWithStatus<T extends { id: string }> = T & {
  statusInfo: DossierStatusInfo;
};

// Ordre de tri : rouge d'abord, puis orange, puis vert.
const STATUS_RANK: Record<DossierStatus, number> = { red: 0, orange: 1, green: 2 };

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function frenchInterval(days: number): string {
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  if (days < 30) return `il y a ${days} jours`;
  if (days < 60) return `il y a environ 1 mois`;
  return `il y a ${Math.round(days / 30)} mois`;
}

/**
 * Calcule le statut et les raisons pour une liste de dossiers en 2 requêtes
 * groupées (pour éviter N+1 sur la DB).
 */
export async function computeDossierStatuses<
  T extends { id: string }
>(dossiers: T[]): Promise<DossierWithStatus<T>[]> {
  if (dossiers.length === 0) return [];

  const admin = createAdminClient();
  const dossierIds = dossiers.map((d) => d.id);

  // 1. Compte des écritures TVA (comptes commençant par 4457 ou 4456) par dossier
  //    + dernière date d'écriture.
  const { data: fecStats } = await admin
    .from("fec_lines")
    .select("dossier_id, compte_num, ecriture_date")
    .in("dossier_id", dossierIds);

  // 2. Compte des documents factures par dossier (tout doc qui n'est pas le FEC lui-même)
  const { data: docs } = await admin
    .from("documents")
    .select("dossier_id, type")
    .in("dossier_id", dossierIds);

  const now = new Date();

  const tvaByDossier = new Map<string, number>();
  const lastEntryByDossier = new Map<string, Date>();

  for (const line of fecStats ?? []) {
    const compte = line.compte_num || "";
    if (compte.startsWith("4457") || compte.startsWith("4456")) {
      tvaByDossier.set(
        line.dossier_id,
        (tvaByDossier.get(line.dossier_id) ?? 0) + 1
      );
    }
    if (line.ecriture_date) {
      const d = new Date(line.ecriture_date);
      const current = lastEntryByDossier.get(line.dossier_id);
      if (!current || d > current) {
        lastEntryByDossier.set(line.dossier_id, d);
      }
    }
  }

  const invoiceDocsByDossier = new Map<string, number>();
  for (const doc of docs ?? []) {
    // On considère comme "justificatif" tout document sauf le FEC lui-même
    if (doc.type !== "fec") {
      invoiceDocsByDossier.set(
        doc.dossier_id,
        (invoiceDocsByDossier.get(doc.dossier_id) ?? 0) + 1
      );
    }
  }

  return dossiers.map((dossier) => {
    const tvaLines = tvaByDossier.get(dossier.id) ?? 0;
    const invoiceDocs = invoiceDocsByDossier.get(dossier.id) ?? 0;
    const missing = Math.max(0, tvaLines - invoiceDocs);
    const lastEntry = lastEntryByDossier.get(dossier.id) ?? null;
    const daysSince = lastEntry ? daysBetween(now, lastEntry) : null;

    const reasons: string[] = [];
    let status: DossierStatus = "green";

    // --- Critère 1 : écritures TVA sans justificatif ---
    if (tvaLines > 0 && invoiceDocs === 0) {
      status = "red";
      reasons.push(
        `${tvaLines} écriture${tvaLines > 1 ? "s" : ""} TVA sans aucun justificatif`
      );
    } else if (missing >= Math.max(3, Math.ceil(tvaLines * 0.5))) {
      status = "red";
      reasons.push(
        `${missing} écriture${missing > 1 ? "s" : ""} TVA sans justificatif`
      );
    } else if (missing > 0) {
      // Moins grave : 1-2 factures manquent, on passe en orange
      if (status === "green") status = "orange";
      reasons.push(
        `${missing} écriture${missing > 1 ? "s" : ""} TVA sans justificatif`
      );
    }

    // --- Critère 2 : fraîcheur des données ---
    if (daysSince !== null) {
      if (daysSince > 30) {
        status = "red"; // force red, quel que soit l'état TVA
        reasons.push(`Dernière écriture ${frenchInterval(daysSince)}`);
      } else if (daysSince > 15) {
        if (status === "green") status = "orange";
        reasons.push(`Dernière écriture ${frenchInterval(daysSince)}`);
      }
    } else if (tvaLines === 0) {
      // Pas de FEC du tout → impossible de juger, on reste vert mais on le signale
      reasons.push("Aucune donnée FEC importée");
    }

    return {
      ...dossier,
      statusInfo: {
        status,
        reasons,
        missingDocsCount: missing,
        tvaLinesCount: tvaLines,
        invoiceDocsCount: invoiceDocs,
        daysSinceLastEntry: daysSince,
      },
    };
  });
}

/**
 * Trie une liste de dossiers déjà enrichis par statusInfo :
 * rouges en haut, orange ensuite, verts en bas.
 * Au sein d'un groupe, on privilégie les dossiers avec le plus de jours
 * d'ancienneté (plus urgents d'abord).
 */
export function sortByUrgency<T extends { statusInfo: DossierStatusInfo }>(
  dossiers: T[]
): T[] {
  return [...dossiers].sort((a, b) => {
    const rankA = STATUS_RANK[a.statusInfo.status];
    const rankB = STATUS_RANK[b.statusInfo.status];
    if (rankA !== rankB) return rankA - rankB;

    // Au sein du même statut : dossier dont la dernière écriture est la plus
    // ancienne remonte en premier (ou aucun FEC → à la fin)
    const daysA = a.statusInfo.daysSinceLastEntry ?? -1;
    const daysB = b.statusInfo.daysSinceLastEntry ?? -1;
    return daysB - daysA;
  });
}
