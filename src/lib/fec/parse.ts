// Parser FEC — Fichier des Écritures Comptables (norme article A47 A-1 LPF).
// Accepte CSV ou TSV. Détecte automatiquement le séparateur.
// Retourne les lignes typées + des agrégats utiles pour le dossier.

export type FecLine = {
  journal_code: string | null;
  journal_lib: string | null;
  ecriture_num: string | null;
  ecriture_date: string | null; // YYYY-MM-DD
  compte_num: string | null;
  compte_lib: string | null;
  comp_aux_num: string | null;
  comp_aux_lib: string | null;
  piece_ref: string | null;
  piece_date: string | null; // YYYY-MM-DD
  ecriture_lib: string | null;
  debit: number;
  credit: number;
  ecriture_let: string | null;
  date_let: string | null; // YYYY-MM-DD
  valid_date: string | null; // YYYY-MM-DD
  montant_devise: number | null;
  idevise: string | null;
  line_number: number;
};

export type FecSummary = {
  line_count: number;
  total_debit: number;
  total_credit: number;
  first_date: string | null;
  last_date: string | null;
  period_start: string | null;
  period_end: string | null;
  // TVA
  tva_collectee: number; // compte 44571 et sous-comptes
  tva_deductible: number; // compte 44566 et sous-comptes
  // Balance simplifiée classe 6 / 7
  charges_total: number; // compte 6xxxxx
  produits_total: number; // compte 7xxxxx
};

export type ParseFecResult = {
  ok: true;
  lines: FecLine[];
  summary: FecSummary;
  warnings: string[];
} | {
  ok: false;
  error: string;
};

// 18 colonnes FEC officielles (ordre canonique)
const FEC_COLUMNS = [
  "JournalCode",
  "JournalLib",
  "EcritureNum",
  "EcritureDate",
  "CompteNum",
  "CompteLib",
  "CompAuxNum",
  "CompAuxLib",
  "PieceRef",
  "PieceDate",
  "EcritureLib",
  "Debit",
  "Credit",
  "EcritureLet",
  "DateLet",
  "ValidDate",
  "Montantdevise",
  "Idevise",
] as const;

function detectSeparator(firstLine: string): string {
  const candidates = ["\t", "|", ";", ","];
  let best = "\t";
  let bestCount = 0;
  for (const sep of candidates) {
    const count = firstLine.split(sep).length;
    if (count > bestCount) {
      bestCount = count;
      best = sep;
    }
  }
  return best;
}

function stripBom(s: string): string {
  if (s.charCodeAt(0) === 0xfeff) return s.slice(1);
  return s;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "").replace(/[_\-]/g, "");
}

function parseFrenchNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "-") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseFecDate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;
  // YYYYMMDD (most common for FEC)
  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  // YYYY-MM-DD already
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY
  const frMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (frMatch) return `${frMatch[3]}-${frMatch[2]}-${frMatch[1]}`;
  return null;
}

// Split une ligne CSV en tenant compte des quotes
function splitCsvLine(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === sep && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

export function parseFec(rawText: string): ParseFecResult {
  const text = stripBom(rawText).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n").filter((l) => l.trim() !== "");

  if (lines.length < 2) {
    return { ok: false, error: "Fichier FEC vide ou invalide (moins de 2 lignes)." };
  }

  const firstLine = lines[0];
  const sep = detectSeparator(firstLine);
  const headersRaw = splitCsvLine(firstLine, sep);
  const headers = headersRaw.map(normalizeHeader);

  // Map FEC columns → index
  const colIndex: Record<string, number> = {};
  for (const col of FEC_COLUMNS) {
    const idx = headers.indexOf(normalizeHeader(col));
    if (idx >= 0) colIndex[col] = idx;
  }

  const warnings: string[] = [];
  const missing = FEC_COLUMNS.filter((c) => colIndex[c] === undefined);
  if (missing.length > 0) {
    warnings.push(
      `Colonnes FEC manquantes : ${missing.join(", ")} — import partiel.`
    );
  }

  const parsed: FecLine[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = splitCsvLine(lines[i], sep);
    if (parts.length < 2) continue;

    const get = (col: (typeof FEC_COLUMNS)[number]) => {
      const idx = colIndex[col];
      if (idx === undefined) return "";
      return parts[idx] ?? "";
    };

    const line: FecLine = {
      journal_code: get("JournalCode") || null,
      journal_lib: get("JournalLib") || null,
      ecriture_num: get("EcritureNum") || null,
      ecriture_date: parseFecDate(get("EcritureDate")),
      compte_num: get("CompteNum") || null,
      compte_lib: get("CompteLib") || null,
      comp_aux_num: get("CompAuxNum") || null,
      comp_aux_lib: get("CompAuxLib") || null,
      piece_ref: get("PieceRef") || null,
      piece_date: parseFecDate(get("PieceDate")),
      ecriture_lib: get("EcritureLib") || null,
      debit: parseFrenchNumber(get("Debit")),
      credit: parseFrenchNumber(get("Credit")),
      ecriture_let: get("EcritureLet") || null,
      date_let: parseFecDate(get("DateLet")),
      valid_date: parseFecDate(get("ValidDate")),
      montant_devise: get("Montantdevise")
        ? parseFrenchNumber(get("Montantdevise"))
        : null,
      idevise: get("Idevise") || null,
      line_number: i,
    };
    parsed.push(line);
  }

  if (parsed.length === 0) {
    return { ok: false, error: "Aucune ligne FEC exploitable après parsing." };
  }

  const summary = computeSummary(parsed);

  if (Math.abs(summary.total_debit - summary.total_credit) > 0.02) {
    warnings.push(
      `Balance débit/crédit non équilibrée : débit=${summary.total_debit.toFixed(
        2
      )} €, crédit=${summary.total_credit.toFixed(2)} €. À vérifier.`
    );
  }

  return { ok: true, lines: parsed, summary, warnings };
}

function computeSummary(lines: FecLine[]): FecSummary {
  let total_debit = 0;
  let total_credit = 0;
  let tva_collectee = 0;
  let tva_deductible = 0;
  let charges_total = 0;
  let produits_total = 0;
  let first_date: string | null = null;
  let last_date: string | null = null;

  for (const l of lines) {
    total_debit += l.debit;
    total_credit += l.credit;

    const compte = l.compte_num || "";

    if (compte.startsWith("44571")) {
      // TVA collectée = crédit - débit (normalement credit > debit)
      tva_collectee += l.credit - l.debit;
    } else if (compte.startsWith("44566") || compte.startsWith("44562")) {
      // TVA déductible sur achats (44566) et sur immo (44562)
      tva_deductible += l.debit - l.credit;
    }

    if (/^6/.test(compte)) {
      charges_total += l.debit - l.credit;
    } else if (/^7/.test(compte)) {
      produits_total += l.credit - l.debit;
    }

    if (l.ecriture_date) {
      if (!first_date || l.ecriture_date < first_date) first_date = l.ecriture_date;
      if (!last_date || l.ecriture_date > last_date) last_date = l.ecriture_date;
    }
  }

  return {
    line_count: lines.length,
    total_debit: round2(total_debit),
    total_credit: round2(total_credit),
    first_date,
    last_date,
    period_start: first_date,
    period_end: last_date,
    tva_collectee: round2(tva_collectee),
    tva_deductible: round2(tva_deductible),
    charges_total: round2(charges_total),
    produits_total: round2(produits_total),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
