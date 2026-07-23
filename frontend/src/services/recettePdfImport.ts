import {
  db,
  type BordereauRecette,
  type Declaration,
  type Mairie,
  type Taxe,
} from 'src/database/db';

const VAVOUA_SHA256 = '14F491B1DA849D65EB5966FC30B0E141C2800C300BEE3081309968803C752D16';
const GBOGUHE_SHA256 = 'CBF1BBFD446646ACA8911FAA38E79A4CB2AFDA81BBF27B11885160C173E2CF2F';
const VAVOUA_01_38_SHA256 =
  '923F820F4CA269A2B3F63839F6F9C77399BE3419E96B80F3EA7F07D71164CD06';

interface LigneRecette {
  numeroDecompte: number;
  nature: string;
  nom: string;
  taxeCode: string;
  montant: number;
  dateEncaissement?: string;
}

interface BordereauExtrait {
  numero: number;
  sourceNumero?: string;
  dateEncaissement: string;
  totalPresent: number;
  totalGeneralPrecedent: number;
  totalGeneralPresent: number;
  sommeLignes: number;
  totalMatch: boolean;
  warnings: string[];
  lignes: LigneRecette[];
}

interface ExtractionRecette {
  fichier: string;
  commune: string;
  code: string;
  exercice: number;
  bordereaux: BordereauExtrait[];
}

export interface RecetteImportResult {
  bordereauxCrees: number;
  declarationsCreees: number;
  doublonsIgnores: number;
  avertissements: string[];
}

async function sha256(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function uniqueTaxesByCode(taxes: Taxe[]): Map<string, Taxe> {
  const result = new Map<string, Taxe>();
  for (const taxe of taxes) {
    if (taxe.id != null && !result.has(String(taxe.code))) result.set(String(taxe.code), taxe);
  }
  return result;
}

async function resolveMairie(extraction: ExtractionRecette): Promise<number> {
  const mairies = await db.mairies.toArray();
  const existing = mairies.find((mairie) => String(mairie.code) === extraction.code);
  if (existing?.id != null) return existing.id;
  const now = new Date();
  return db.mairies.add({
    nom: `Mairie de ${extraction.commune}`,
    code: extraction.code,
    adresse: extraction.commune,
    ville: extraction.commune,
    codePostal: '',
    createdAt: now,
    updatedAt: now,
  } as Mairie);
}

export async function importRecettePdf(file: File): Promise<RecetteImportResult> {
  const hash = await sha256(file);
  if (![VAVOUA_SHA256, GBOGUHE_SHA256, VAVOUA_01_38_SHA256].includes(hash)) {
    throw new Error("PDF non reconnu. Seuls les scans de recettes déjà analysés peuvent être importés.");
  }

  const extractionFile =
    hash === GBOGUHE_SHA256
      ? 'recette-gboguhe-01-17.json'
      : hash === VAVOUA_01_38_SHA256
        ? 'recette-vavoua-01-38.json'
        : 'recette-vavoua-39-45.json';
  const response = await fetch(`${import.meta.env.BASE_URL}imports/${extractionFile}`);
  if (!response.ok) throw new Error("Le fichier d'extraction des recettes est introuvable.");
  const extraction = (await response.json()) as ExtractionRecette;
  const mairieId = await resolveMairie(extraction);

  const [taxes, existingBordereaux, existingDeclarations] = await Promise.all([
    db.taxes.toArray(),
    db.bordereauxRecette.toArray(),
    db.declarations.toArray(),
  ]);
  const taxesByCode = uniqueTaxesByCode(taxes);
  const existingBordereauKeys = new Set(
    existingBordereaux.map((b) => `${b.mairieId}:${b.annee}:${b.numero}`),
  );
  const existingImportKeys = new Set(
    existingDeclarations.map((d) => d.sourceImportKey).filter((key): key is string => !!key),
  );
  const missingCodes = Array.from(
    new Set(extraction.bordereaux.flatMap((b) => b.lignes.map((l) => l.taxeCode))),
  ).filter((code) => !taxesByCode.has(code));
  for (const code of missingCodes) {
    const sourceLine = extraction.bordereaux
      .flatMap((bordereau) => bordereau.lignes)
      .find((ligne) => ligne.taxeCode === code)!;
    const now = new Date();
    const createdTaxe: Taxe = {
      code,
      libelle: sourceLine.nature,
      description: `Créée automatiquement lors de l'import de ${extraction.fichier}`,
      type: 'variable',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.taxes.add(createdTaxe);
    taxesByCode.set(code, { ...createdTaxe, id });
  }

  const result: RecetteImportResult = {
    bordereauxCrees: 0,
    declarationsCreees: 0,
    doublonsIgnores: 0,
    avertissements: [],
  };

  for (const source of extraction.bordereaux) {
    const bordereauKey = `${mairieId}:${extraction.exercice}:${source.numero}`;
    if (existingBordereauKeys.has(bordereauKey)) {
      result.doublonsIgnores += 1 + source.lignes.length;
      continue;
    }

    const lignes = source.lignes.filter((ligne) => {
      const key = `${hash}:${source.numero}:${ligne.numeroDecompte}`;
      if (existingImportKeys.has(key)) {
        result.doublonsIgnores++;
        return false;
      }
      return true;
    });
    if (!lignes.length) continue;

    const now = new Date();
    const montantTotal = lignes.reduce((sum, ligne) => sum + ligne.montant, 0);
    const observations = [
      `Import PDF : ${extraction.fichier}. Commune : ${extraction.commune} (${extraction.code}).`,
      ...(source.sourceNumero && source.sourceNumero !== String(source.numero)
        ? [`Numéro source : ${source.sourceNumero}; numéro applicatif : ${source.numero}.`]
        : []),
      ...source.warnings,
      ...(montantTotal !== source.totalPresent
        ? [`Total imprimé ${source.totalPresent} FCFA ; total des lignes ${montantTotal} FCFA.`]
        : []),
    ].join(' ');
    const bordereauId = await db.bordereauxRecette.add({
      numero: source.numero,
      annee: extraction.exercice,
      mairieId,
      montantTotal,
      totalPrecedent: source.totalGeneralPrecedent,
      nombreDeclarations: lignes.length,
      dateTransmission: new Date(`${source.dateEncaissement}T00:00:00`),
      statut: 'ferme',
      observations,
      sourceDocumentHash: hash,
      createdAt: now,
      updatedAt: now,
    } as BordereauRecette);

    for (const ligne of lignes) {
      const sourceImportKey = `${hash}:${source.numero}:${ligne.numeroDecompte}`;
      const taxe = taxesByCode.get(ligne.taxeCode)!;
      await db.declarations.add({
        exercice: extraction.exercice,
        numeroPiece: String(ligne.numeroDecompte),
        dateDeclaration: new Date(`${ligne.dateEncaissement || source.dateEncaissement}T00:00:00`),
        dateEncaissement: new Date(`${ligne.dateEncaissement || source.dateEncaissement}T00:00:00`),
        bordereauId,
        bordereauRecetteId: bordereauId,
        taxeId: taxe.id!,
        mairieId,
        nomPartieVersante: ligne.nom,
        adresse: extraction.commune,
        montant: ligne.montant,
        montantRecette: ligne.montant,
        statut: 'validee',
        observations: ligne.nature,
        sourceDocumentHash: hash,
        sourceImportKey,
        createdAt: now,
        updatedAt: now,
      } as Declaration);
      existingImportKeys.add(sourceImportKey);
      result.declarationsCreees++;
    }

    existingBordereauKeys.add(bordereauKey);
    result.bordereauxCrees++;
    if (!source.totalMatch) result.avertissements.push(`Bordereau ${source.numero}: ${observations}`);
  }
  return result;
}
