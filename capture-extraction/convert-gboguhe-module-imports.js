const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IMPORTS = path.join(ROOT, 'frontend', 'public', 'imports');

const PATHS = {
  depenseSources: [
    path.join(IMPORTS, 'depense-gboguhe-01-22.json'),
    path.join(IMPORTS, 'depense-gboguhe-23-plus.json'),
  ],
  recetteSource: path.join(IMPORTS, 'recette-gboguhe-01-17.json'),
  depenseReference: 'C:\\Me\\sigobc-module-depenses-2026-07-18-13-32-05.json',
  recetteReference: 'C:\\Me\\sigobc-module-recettes-2026-07-18-13-32-06.json',
  depenseOutput: path.join(IMPORTS, 'sigobc-module-depenses-gboguhe-import.json'),
  recetteOutput: path.join(IMPORTS, 'sigobc-module-recettes-gboguhe-import.json'),
};

const DEPENSE_HASHES = {
  'depense-gboguhe-01-22.json':
    'F8475D91AF3AD0248E72181DE780835B00F479C747CBFFA391A79AF78A993B21',
  'depense-gboguhe-23-plus.json':
    '47BCF12530943D410FCF6F7210B0397E1FDDC4C3BCD80BE6968C0F66B5547587',
};
const RECETTE_HASH =
  'CBF1BBFD446646ACA8911FAA38E79A4CB2AFDA81BBF27B11885160C173E2CF2F';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function maxId(rows) {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0);
}

function makeStats(data) {
  return Object.fromEntries(Object.entries(data).map(([name, rows]) => [name, rows.length]));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function requireUnique(rows, key, label) {
  const seen = new Set();
  const duplicates = [];
  for (const row of rows) {
    const value = row[key];
    if (seen.has(value)) duplicates.push(value);
    seen.add(value);
  }
  if (duplicates.length) {
    throw new Error(`${label}: doublons ${key}: ${[...new Set(duplicates)].join(', ')}`);
  }
}

function buildDepenses(now) {
  const reference = readJson(PATHS.depenseReference);
  const sources = PATHS.depenseSources.map((file) => ({
    file,
    name: path.basename(file),
    extraction: readJson(file),
  }));
  const base = reference.data;
  const chapitres = [...(base.chapitres || [])];
  const sousChapitres = [...(base.sousChapitres || [])];
  const chapitreByCode = new Map();
  const sousChapitreByCode = new Map();

  for (const chapitre of chapitres) {
    const code = String(chapitre.code);
    if (!chapitreByCode.has(code)) chapitreByCode.set(code, chapitre.id);
  }
  for (const sousChapitre of sousChapitres) {
    const code = String(sousChapitre.code);
    if (!sousChapitreByCode.has(code)) sousChapitreByCode.set(code, sousChapitre.id);
  }

  let nextChapitreId = maxId(chapitres) + 1;
  let nextSousChapitreId = maxId(sousChapitres) + 1;
  let nextBordereauId = maxId(base.bordereauMandats || []) + 1;
  let nextMandatId = maxId(base.mandats || []) + 1;

  function ensureChapitre(code) {
    const normalizedCode = String(code);
    if (chapitreByCode.has(normalizedCode)) {
      return chapitreByCode.get(normalizedCode);
    }
    const row = {
      code: normalizedCode,
      libelle:
        normalizedCode === '9'
          ? 'INVESTISSEMENT'
          : `Chapitre ${normalizedCode}`,
      mairieId: 1,
      actif: true,
      createdAt: now,
      updatedAt: now,
      id: nextChapitreId++,
    };
    chapitres.push(row);
    chapitreByCode.set(normalizedCode, row.id);
    return row.id;
  }

  function ensureSousChapitre(code, libelle) {
    const normalizedCode = String(code);
    if (sousChapitreByCode.has(normalizedCode)) {
      return sousChapitreByCode.get(normalizedCode);
    }
    const row = {
      code: normalizedCode,
      libelle: libelle || `Sous-chapitre ${normalizedCode}`,
      mairieId: 1,
      actif: true,
      createdAt: now,
      updatedAt: now,
      id: nextSousChapitreId++,
    };
    sousChapitres.push(row);
    sousChapitreByCode.set(normalizedCode, row.id);
    return row.id;
  }

  const bordereauMandats = [];
  const mandats = [];
  const sourceFolios = [];
  for (const source of sources) {
    for (const folio of source.extraction.folios) {
      sourceFolios.push({ source, folio });
    }
  }
  sourceFolios.sort((a, b) => a.folio.numero - b.folio.numero);

  requireUnique(
    sourceFolios.map(({ folio }) => folio),
    'numero',
    'Dépenses',
  );

  for (const { source, folio } of sourceFolios) {
    const bordereauId = nextBordereauId++;
    const sourceHash = DEPENSE_HASHES[source.name];
    const dateEmission = folio.dateEmission
      ? `${folio.dateEmission}T00:00:00.000Z`
      : now;
    const sommeLignes = folio.mandats.reduce((sum, mandat) => {
      if (mandat.somme == null) {
        throw new Error(`Dépenses: montant absent au folio ${folio.numero}`);
      }
      return sum + mandat.somme;
    }, 0);
    if (sommeLignes !== folio.totalPresent) {
      throw new Error(
        `Dépenses: folio ${folio.numero}, somme ${sommeLignes} != total ${folio.totalPresent}`,
      );
    }

    const observations = [
      `Import PDF : ${source.extraction.fichier}. Commune : ${source.extraction.commune} (${source.extraction.code}).`,
      ...(folio.warnings || []),
    ].join(' ');

    bordereauMandats.push({
      numero: folio.numero,
      exercice: folio.exercice,
      dateEmission,
      mairieId: 1,
      montantTotal: sommeLignes,
      totalPrecedent: folio.totalPrecedent,
      nombreMandats: folio.mandats.length,
      statut: 'ferme',
      observations,
      personnelId: 1,
      sourceDocumentHash: sourceHash,
      createdAt: now,
      updatedAt: now,
      id: bordereauId,
    });

    for (const sourceMandat of folio.mandats) {
      const chapitreCode =
        sourceMandat.chapitre == null ? '9' : String(sourceMandat.chapitre);
      const chapitreId = ensureChapitre(chapitreCode);
      if (sourceMandat.imputationFonctionnelle == null) {
        throw new Error(
          `Dépenses: sous-chapitre absent (folio ${folio.numero}, mandat ${sourceMandat.numeroOrdre})`,
        );
      }
      const sousChapitreId = ensureSousChapitre(
        sourceMandat.imputationFonctionnelle,
        sourceMandat.nature,
      );
      const sourceImportKey = `${sourceHash}:${folio.numero}:${sourceMandat.numeroOrdre}`;
      mandats.push({
        numeroMandat: String(sourceMandat.numeroOrdre),
        numeroOrdre: sourceMandat.numeroOrdre,
        exercice: folio.exercice,
        chapitreId,
        sousChapitreId,
        bordereauMandatId: bordereauId,
        beneficiaire: sourceMandat.creancier,
        rib: '',
        patrimonial: '',
        objet: sourceMandat.nature,
        montant: sourceMandat.somme,
        numeroFacture: '',
        modePaiement: 'virement',
        statut: 'paye',
        observations: '',
        motifAnnulation: '',
        referenceMarche: '',
        avisMunicipalite: '',
        numeroDeliberation: '',
        montantPrecompter: 0,
        dateMandat: dateEmission,
        mairieId: 1,
        personnelId: 1,
        sourceDocumentHash: sourceHash,
        sourceImportKey,
        createdAt: now,
        updatedAt: now,
        id: nextMandatId++,
      });
    }
  }

  requireUnique(mandats, 'numeroMandat', 'Dépenses');
  requireUnique(mandats, 'sourceImportKey', 'Dépenses');

  const data = {
    chapitres,
    sousChapitres,
    previsions: base.previsions || [],
    mandats,
    bordereauMandats,
    etatFinancierMensuel: base.etatFinancierMensuel || [],
  };
  return {
    version: '3.0',
    appName: 'SIGOBC-MAIRIE',
    exportType: 'module',
    moduleKey: 'depenses',
    moduleLabel: 'Dépenses',
    commune: 'GBOGUHE (491)',
    exportDate: now,
    data,
    stats: makeStats(data),
  };
}

function buildRecettes(now) {
  const reference = readJson(PATHS.recetteReference);
  const extraction = readJson(PATHS.recetteSource);
  const base = reference.data;
  const taxes = [...(base.taxes || [])];
  const taxeByCode = new Map();
  for (const taxe of taxes) {
    const code = String(taxe.code);
    if (!taxeByCode.has(code)) taxeByCode.set(code, taxe.id);
  }

  let nextTaxeId = maxId(taxes) + 1;
  let nextBordereauId = maxId(base.bordereauxRecette || []) + 1;
  let nextDeclarationId = maxId(base.declarations || []) + 1;

  function ensureTaxe(code, libelle) {
    const normalizedCode = String(code);
    if (taxeByCode.has(normalizedCode)) return taxeByCode.get(normalizedCode);
    const row = {
      code: normalizedCode,
      libelle: libelle || `Taxe ${normalizedCode}`,
      description: `Créée automatiquement lors de l'import de ${extraction.fichier}`,
      type: 'variable',
      mairieId: 1,
      actif: true,
      createdAt: now,
      updatedAt: now,
      id: nextTaxeId++,
    };
    taxes.push(row);
    taxeByCode.set(normalizedCode, row.id);
    return row.id;
  }

  const bordereauxRecette = [];
  const declarations = [];
  requireUnique(extraction.bordereaux, 'numero', 'Recettes');

  for (const source of extraction.bordereaux) {
    const bordereauId = nextBordereauId++;
    const sommeLignes = source.lignes.reduce((sum, ligne) => sum + ligne.montant, 0);
    if (sommeLignes !== source.totalPresent) {
      throw new Error(
        `Recettes: bordereau ${source.numero}, somme ${sommeLignes} != total ${source.totalPresent}`,
      );
    }
    const dateTransmission = `${source.dateEncaissement}T00:00:00.000Z`;
    const observations = [
      `Import PDF : ${extraction.fichier}. Commune : ${extraction.commune} (${extraction.code}).`,
      ...(source.warnings || []),
    ].join(' ');
    bordereauxRecette.push({
      numero: source.numero,
      annee: extraction.exercice,
      mairieId: 1,
      montantTotal: sommeLignes,
      totalPrecedent: source.totalGeneralPrecedent,
      nombreDeclarations: source.lignes.length,
      dateTransmission,
      statut: 'ferme',
      observations,
      personnelId: 1,
      sourceDocumentHash: RECETTE_HASH,
      createdAt: now,
      updatedAt: now,
      id: bordereauId,
    });

    for (const ligne of source.lignes) {
      const taxeId = ensureTaxe(ligne.taxeCode, ligne.nature);
      const dateOperation = `${
        ligne.dateEncaissement || source.dateEncaissement
      }T00:00:00.000Z`;
      const sourceImportKey = `${RECETTE_HASH}:${source.numero}:${ligne.numeroDecompte}`;
      declarations.push({
        exercice: extraction.exercice,
        numeroPiece: String(ligne.numeroDecompte),
        dateDeclaration: dateOperation,
        dateEncaissement: dateOperation,
        bordereauId,
        bordereauRecetteId: bordereauId,
        taxeId,
        mairieId: 1,
        contribuable: ligne.nom,
        nomPartieVersante: ligne.nom,
        adresse: extraction.commune,
        numeroLivre: String(ligne.taxeCode),
        montant: ligne.montant,
        montantRecette: ligne.montant,
        modePaiement: 'especes',
        statut: 'validee',
        observations: ligne.nature,
        personnelId: 1,
        sourceDocumentHash: RECETTE_HASH,
        sourceImportKey,
        createdAt: now,
        updatedAt: now,
        id: nextDeclarationId++,
      });
    }
  }

  requireUnique(declarations, 'sourceImportKey', 'Recettes');

  const data = {
    taxes,
    chapitresRecette: base.chapitresRecette || [],
    declarations,
    bordereauxRecette,
    previsionsRecettes: base.previsionsRecettes || [],
    mandatsRecette: base.mandatsRecette || [],
    bordereauMandatsRecette: base.bordereauMandatsRecette || [],
    etatFinancierMensuelRecette: base.etatFinancierMensuelRecette || [],
  };
  return {
    version: '3.0',
    appName: 'SIGOBC-MAIRIE',
    exportType: 'module',
    moduleKey: 'recettes',
    moduleLabel: 'Recettes',
    commune: 'GBOGUHE (491)',
    exportDate: now,
    data,
    stats: makeStats(data),
  };
}

function validateOutputs(depenses, recettes) {
  const chapitreIds = new Set(depenses.data.chapitres.map((row) => row.id));
  const sousChapitreIds = new Set(depenses.data.sousChapitres.map((row) => row.id));
  const bordereauDepenseIds = new Set(
    depenses.data.bordereauMandats.map((row) => row.id),
  );
  for (const mandat of depenses.data.mandats) {
    if (!chapitreIds.has(mandat.chapitreId)) {
      throw new Error(`Mandat ${mandat.numeroMandat}: chapitreId orphelin`);
    }
    if (!sousChapitreIds.has(mandat.sousChapitreId)) {
      throw new Error(`Mandat ${mandat.numeroMandat}: sousChapitreId orphelin`);
    }
    if (!bordereauDepenseIds.has(mandat.bordereauMandatId)) {
      throw new Error(`Mandat ${mandat.numeroMandat}: bordereauMandatId orphelin`);
    }
  }

  const taxeIds = new Set(recettes.data.taxes.map((row) => row.id));
  const bordereauRecetteIds = new Set(
    recettes.data.bordereauxRecette.map((row) => row.id),
  );
  for (const declaration of recettes.data.declarations) {
    if (!taxeIds.has(declaration.taxeId)) {
      throw new Error(`Déclaration ${declaration.numeroPiece}: taxeId orphelin`);
    }
    if (!bordereauRecetteIds.has(declaration.bordereauRecetteId)) {
      throw new Error(`Déclaration ${declaration.numeroPiece}: bordereauRecetteId orphelin`);
    }
  }
}

const now = new Date().toISOString();
const depenses = buildDepenses(now);
const recettes = buildRecettes(now);
validateOutputs(depenses, recettes);
writeJson(PATHS.depenseOutput, depenses);
writeJson(PATHS.recetteOutput, recettes);

console.log(`Dépenses: ${PATHS.depenseOutput}`);
console.log(
  `  ${depenses.data.bordereauMandats.length} bordereaux, ${depenses.data.mandats.length} mandats, ` +
    `${depenses.data.mandats.reduce((sum, row) => sum + row.montant, 0)} FCFA`,
);
console.log(`Recettes: ${PATHS.recetteOutput}`);
console.log(
  `  ${recettes.data.bordereauxRecette.length} bordereaux, ${recettes.data.declarations.length} déclarations, ` +
    `${recettes.data.declarations.reduce((sum, row) => sum + row.montant, 0)} FCFA`,
);
