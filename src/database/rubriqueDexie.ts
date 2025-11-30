import { db, DEFAULT_MAIRIE_ID } from './db';

export interface ParsedChapitreFixe {
  code: string;
  libelle: string;
}

export interface ParsedRow {
  section?: string;
  code: string;
  libelle: string;
  amounts: Record<string, number | null>;
}

export interface BudgetAnalysisResult {
  chapitresFixes: ParsedChapitreFixe[];
  rows: ParsedRow[];
}

function normalizeAmount(val: string): number | null {
  const cleaned = val.replace(/\?/g, '').replace(/\s+/g, '').trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function extractQuotedLabels(lines: string[]): string[] {
  const headerBlob = lines.slice(0, 9).join('\n');
  const matches = [...headerBlob.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const labels = matches
    .map((t) => t.replace(/\r?\n/g, ' ').trim())
    .filter((t) => t && !/^RUBRIQUES BUDGETAIRES$/i.test(t));
  // Remove trailing (n) markers
  return labels.map((t) => t.replace(/\s*\(\d+\)\s*$/g, '').trim());
}

function parseRow(line: string, rubricLabels: string[]): ParsedRow | null {
  const parts = line.split(';');
  if (parts.length < 2) return null;

  // First field contains code + libellé
  const head = parts[0];
  const codeMatch = head.match(/^\s*(\d{2,5})/);
  if (!codeMatch) return null;
  const code = codeMatch[1];
  const libelle = head.replace(/^\s*\d{2,5}\s+/, '').trim();
  if (!libelle) return null;

  const amounts: Record<string, number | null> = {};
  for (let i = 1; i < parts.length && i <= rubricLabels.length; i++) {
    const label = rubricLabels[i - 1]!;
    amounts[label] = normalizeAmount(parts[i]!);
  }

  const section = code.length >= 2 ? code.slice(0, 2) : undefined;
  return { section, code, libelle, amounts };
}

export async function loadBudget2025Csv(): Promise<string> {
  const res = await fetch('/budget2025.csv');
  if (!res.ok) throw new Error('Impossible de charger budget2025.csv');
  return await res.text();
}

export function analyzeBudgetCsv(csvText: string): BudgetAnalysisResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rubricLabels = extractQuotedLabels(lines);
  const rows: ParsedRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const row = parseRow(line, rubricLabels);
    if (!row) continue;
    if (/^Sous-total/i.test(row.libelle)) continue;
    rows.push(row);
  }

  const chapitresFixes: ParsedChapitreFixe[] = rubricLabels.map((label, idx) => ({
    code: String(idx + 1).padStart(2, '0'),
    libelle: label,
  }));

  return { chapitresFixes, rows };
}

// Enregistrer les 8 chapitres fixes (colonnes du CSV) dans db.chapitres
export async function upsertChapitresFixes(chapitres: ParsedChapitreFixe[]): Promise<number> {
  const now = new Date();
  let created = 0;
  for (const c of chapitres) {
    const existing = await db.chapitres.where('code').equals(c.code).first();
    if (existing) {
      const id = existing.id;
      if (id != null) {
        await db.chapitres.update(id, {
        libelle: c.libelle,
        updatedAt: now,
        actif: true,
        });
      }
    } else {
      await db.chapitres.add({
        code: c.code,
        libelle: c.libelle,
        description: undefined,
        mairieId: DEFAULT_MAIRIE_ID,
        actif: true,
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }
  }
  return created;
}

// Enregistrer toutes les lignes détaillées (sous-chapitres) comme rubriques
export async function upsertRubriquesFromRows(rows: ParsedRow[]): Promise<number> {
  const now = new Date();
  let created = 0;
  for (const row of rows) {
    const existing = await db.rubriques.where('code').equals(row.code).first();
    if (existing) {
      const id = existing.id;
      if (id != null) {
        await db.rubriques.update(id, {
        libelle: row.libelle,
        updatedAt: now,
        actif: true,
        });
      }
    } else {
      await db.rubriques.add({
        code: row.code,
        libelle: row.libelle,
        description: undefined,
        mairieId: DEFAULT_MAIRIE_ID,
        actif: true,
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }
  }
  return created;
}

export async function importBudget2025IntoDexie(csvText: string) {
  const { chapitresFixes, rows } = analyzeBudgetCsv(csvText);
  const createdChapitresFixes = await upsertChapitresFixes(chapitresFixes);
  const createdRubriques = await upsertRubriquesFromRows(rows);
  return { createdChapitresFixes, createdRubriques, chapitresFixes, rows };
}
