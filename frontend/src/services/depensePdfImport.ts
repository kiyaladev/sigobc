import {
  db,
  type BordereauMandat,
  type Chapitre,
  type Mairie,
  type Mandat,
  type SousChapitre,
} from 'src/database/db';

// SHA-256 (majuscule) des PDF de dépenses déjà analysés et autorisés à l'import.
const GBOGUHE_01_22_SHA256 =
  'F8475D91AF3AD0248E72181DE780835B00F479C747CBFFA391A79AF78A993B21';
const GBOGUHE_23_PLUS_SHA256 =
  '47BCF12530943D410FCF6F7210B0397E1FDDC4C3BCD80BE6968C0F66B5547587';

const HASH_TO_FILE: Record<string, string> = {
  [GBOGUHE_01_22_SHA256]: 'depense-gboguhe-01-22.json',
  [GBOGUHE_23_PLUS_SHA256]: 'depense-gboguhe-23-plus.json',
};

// Libellés standard du plan comptable municipal (Côte d'Ivoire).
const CHAPITRE_LIB: Record<string, string> = {
  '1': 'SALAIRE ET INDEM.', '2': 'CHARGES SOCIALES', '3': 'TRANSP. & FRAIS DE MISS.',
  '4': 'CARBUR. & LUBRIF.', '5': 'MATÉRIEL ET FOURNIT.', '6': 'ABONN. EAU, ÉLEC, TÉLÉPH.',
  '7': "TRAVAUX & SCES A L'ENTREP.", '8': 'INTERVEN ET TRANSF.', '9': 'INVESTISSEMENT',
};
const SOUS_CHAPITRE_LIB: Record<string, string> = {
  '6000': 'Administration', '60010': 'Prime de session', '60012': 'Fonctionnement cabinet du maire',
  '60013': 'Indemnité de fonction et de représentation', '6002': 'Services techniques',
  '6010': 'Services socioculturels', '6020': 'Receveur municipal', '6031': "Services de l'état civil",
  '6100': 'Personnel contractuel', '6131': "Opérations d'assainissement",
};

interface MandatExtrait {
  numeroOrdre: number;
  nature: string;
  creancier: string;
  imputationFonctionnelle: string | null;
  chapitre: string | null;
  somme: number | null;
}
interface FolioExtrait {
  numero: number;
  exercice: number;
  dateEmission: string | null;
  totalPresent: number;
  totalPrecedent: number;
  totalGeneral?: number;
  sommeLignes: number;
  totalMatch: boolean;
  warnings: string[];
  mandats: MandatExtrait[];
}
interface ExtractionDepense {
  fichier: string;
  commune: string;
  code: string;
  folios: FolioExtrait[];
}

export interface DepenseImportResult {
  bordereauxCrees: number;
  mandatsCrees: number;
  doublonsIgnores: number;
  avertissements: string[];
}

async function sha256(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function byCode<T extends { id?: number; code: string | number }>(rows: T[]): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    if (row.id != null && !result.has(String(row.code))) result.set(String(row.code), row);
  }
  return result;
}

async function resolveMairie(extraction: ExtractionDepense): Promise<number> {
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

export async function importDepensePdf(file: File): Promise<DepenseImportResult> {
  const hash = await sha256(file);
  const extractionFile = HASH_TO_FILE[hash];
  if (!extractionFile) {
    throw new Error('PDF non reconnu. Seuls les scans de dépenses déjà analysés peuvent être importés.');
  }

  const response = await fetch(`${import.meta.env.BASE_URL}imports/${extractionFile}`);
  if (!response.ok) throw new Error("Le fichier d'extraction des dépenses est introuvable.");
  const extraction = (await response.json()) as ExtractionDepense;
  const mairieId = await resolveMairie(extraction);

  const [chapitres, sousChapitres, existingBordereaux, existingMandats] = await Promise.all([
    db.chapitres.toArray(),
    db.sousChapitres.toArray(),
    db.bordereauMandats.toArray(),
    db.mandats.toArray(),
  ]);
  const chapByCode = byCode(chapitres);
  const scByCode = byCode(sousChapitres);
  const existingBordereauKeys = new Set(
    existingBordereaux.map((b) => `${b.mairieId}:${b.exercice}:${b.numero}`),
  );
  const existingImportKeys = new Set(
    existingMandats.map((m) => m.sourceImportKey).filter((k): k is string => !!k),
  );

  async function ensureChapitre(code: string): Promise<number> {
    const found = chapByCode.get(code);
    if (found?.id != null) return found.id;
    const now = new Date();
    const rec: Chapitre = {
      code, libelle: CHAPITRE_LIB[code] || `Chapitre ${code}`, mairieId, actif: true,
      createdAt: now, updatedAt: now,
    };
    const id = await db.chapitres.add(rec);
    chapByCode.set(code, { ...rec, id });
    return id;
  }
  async function ensureSousChapitre(code: string, libelleFallback: string): Promise<number> {
    const found = scByCode.get(code);
    if (found?.id != null) return found.id;
    const now = new Date();
    const rec: SousChapitre = {
      code, libelle: SOUS_CHAPITRE_LIB[code] || libelleFallback || `Sous-chapitre ${code}`,
      mairieId, actif: true, createdAt: now, updatedAt: now,
    };
    const id = await db.sousChapitres.add(rec);
    scByCode.set(code, { ...rec, id });
    return id;
  }

  const result: DepenseImportResult = {
    bordereauxCrees: 0, mandatsCrees: 0, doublonsIgnores: 0, avertissements: [],
  };

  for (const folio of extraction.folios) {
    const bordereauKey = `${mairieId}:${folio.exercice}:${folio.numero}`;
    if (existingBordereauKeys.has(bordereauKey)) {
      result.doublonsIgnores += 1 + folio.mandats.length;
      continue;
    }
    const lignes = folio.mandats.filter((m) => {
      // chapitre peut etre null pour les depenses d'investissement (imputation patrimoniale)
      if (m.somme == null || m.imputationFonctionnelle == null) return false;
      const key = `${hash}:${folio.numero}:${m.numeroOrdre}`;
      if (existingImportKeys.has(key)) {
        result.doublonsIgnores++;
        return false;
      }
      return true;
    });
    if (!lignes.length) continue;

    const now = new Date();
    const dateEmission = folio.dateEmission ? new Date(`${folio.dateEmission}T00:00:00`) : now;
    const montantTotal = lignes.reduce((sum, m) => sum + (m.somme as number), 0);
    const observations = [
      `Import PDF : ${extraction.fichier}. Commune : ${extraction.commune} (${extraction.code}).`,
      ...folio.warnings,
      ...(montantTotal !== folio.totalPresent
        ? [`Total imprimé ${folio.totalPresent} FCFA ; total des lignes ${montantTotal} FCFA.`]
        : []),
    ].join(' ');

    const bordereauId = await db.bordereauMandats.add({
      numero: folio.numero,
      exercice: folio.exercice,
      dateEmission,
      mairieId,
      montantTotal,
      totalPrecedent: folio.totalPrecedent,
      nombreMandats: lignes.length,
      statut: 'ferme',
      observations,
      personnelId: 1,
      sourceDocumentHash: hash,
      createdAt: now,
      updatedAt: now,
    } as BordereauMandat);

    for (const m of lignes) {
      // Investissement (chapitre absent) -> chapitre synthetique '9'
      const chapitreId = await ensureChapitre(m.chapitre != null ? String(m.chapitre) : '9');
      const sousChapitreId = await ensureSousChapitre(String(m.imputationFonctionnelle), m.nature);
      const sourceImportKey = `${hash}:${folio.numero}:${m.numeroOrdre}`;
      await db.mandats.add({
        numeroOrdre: m.numeroOrdre,
        exercice: folio.exercice,
        numeroMandat: String(m.numeroOrdre),
        dateMandat: dateEmission,
        chapitreId,
        sousChapitreId,
        bordereauMandatId: bordereauId,
        mairieId,
        beneficiaire: m.creancier,
        objet: m.nature,
        montant: m.somme as number,
        modePaiement: 'virement',
        statut: 'paye',
        personnelId: 1,
        sourceDocumentHash: hash,
        sourceImportKey,
        createdAt: now,
        updatedAt: now,
      } as Mandat);
      existingImportKeys.add(sourceImportKey);
      result.mandatsCrees++;
    }
    existingBordereauKeys.add(bordereauKey);
    result.bordereauxCrees++;
    if (!folio.totalMatch) result.avertissements.push(`Folio ${folio.numero}: ${observations}`);
  }
  return result;
}
