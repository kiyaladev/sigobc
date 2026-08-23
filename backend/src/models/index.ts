import mongoose, { Schema } from 'mongoose';

// ─── helpers ────────────────────────────────────────────────────────────────

const ts = {
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function m(name: string, schema: Schema): mongoose.Model<any> {
  return mongoose.models[name] ?? mongoose.model(name, schema);
}

// ─── Mairie ──────────────────────────────────────────────────────────────────

const MairieSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  nom: String,
  code: String,
  adresse: String,
  ville: String,
  departement: String,
  region: String,
  codePostal: String,
  telephone: String,
  email: String,
  maire: String,
  logo: String,
  numeroEmployeurCNPS: String,
  ...ts,
});
MairieSchema.index({ code: 1 });
export const MairieModel = m('Mairie', MairieSchema);

// ─── Utilisateur ─────────────────────────────────────────────────────────────

const UtilisateurSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  nom: String,
  prenom: String,
  email: String,
  role: { type: String, enum: ['admin', 'gestionnaire', 'operateur', 'agent', 'comptable'] },
  mairieId: Number,
  actif: Boolean,
  derniereConnexion: Date,
  ...ts,
});
export const UtilisateurModel = m('Utilisateur', UtilisateurSchema);

// ─── Taxe ─────────────────────────────────────────────────────────────────────

const TaxeSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  code: String,
  libelle: String,
  description: String,
  taux: Number,
  montant: Number,
  type: { type: String, enum: ['fixe', 'variable'] },
  mairieId: Number,
  actif: Boolean,
  ...ts,
});
export const TaxeModel = m('Taxe', TaxeSchema);

// ─── Chapitre ────────────────────────────────────────────────────────────────

const ChapitreSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  code: String,
  libelle: String,
  description: String,
  mairieId: Number,
  actif: Boolean,
  ...ts,
});
export const ChapitreModel = m('Chapitre', ChapitreSchema);

// ─── SousChapitre ────────────────────────────────────────────────────────────

const SousChapitreSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  code: String,
  libelle: String,
  description: String,
  parentId: Number,
  mairieId: Number,
  actif: Boolean,
  ...ts,
});
export const SousChapitreModel = m('SousChapitre', SousChapitreSchema);

// ─── Prevision ───────────────────────────────────────────────────────────────

const PrevisionSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  exercice: Number,
  chapitreId: Number,
  sousChapitreId: Number,
  mairieId: Number,
  montantPrevu: Number,
  montantEngage: Number,
  montantDisponible: Number,
  typeBien: { type: String, enum: ['immobilier', 'mobilier', 'incorporel'] },
  observations: String,
  statut: { type: String, enum: ['brouillon', 'validee'] },
  personnelId: Number,
  ...ts,
});
export const PrevisionModel = m('Prevision', PrevisionSchema);

// ─── Projet ──────────────────────────────────────────────────────────────────

const ProjetSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  numeroOrdre: String,
  refPT: String,
  libelle: String,
  sousChapitreId: Number,
  patrimoine: String,
  montant: Number,
  realise: Number,
  annee: Number,
  typeBien: { type: String, enum: ['immobilier', 'mobilier', 'incorporel'] },
  statut: { type: String, enum: ['en_cours', 'termine', 'annule'] },
  observations: String,
  alienationCompteFonctionnel: String,
  alienationComptePatrimonial: String,
  alienationMontant: Number,
  mairieId: Number,
  personnelId: Number,
  ...ts,
});
ProjetSchema.index({ annee: 1, sousChapitreId: 1, mairieId: 1 });
export const ProjetModel = m('Projet', ProjetSchema);

// ─── Mandat ──────────────────────────────────────────────────────────────────

const MandatSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  numeroOrdre: Number,
  exercice: Number,
  numeroMandat: String,
  dateMandat: Date,
  chapitreId: Number,
  sousChapitreId: Number,
  etatMensuelId: String,
  previsionId: Number,
  bordereauMandatId: Number,
  mairieId: Number,
  beneficiaire: String,
  rib: String,
  banqueId: Number,
  patrimonial: String,
  objet: String,
  montant: Number,
  numeroFacture: String,
  dateFacture: Date,
  modePaiement: { type: String, enum: ['virement', 'cheque', 'especes', 'autre'] },
  statut: { type: String, enum: ['brouillon', 'paye', 'annule'] },
  motifAnnulation: String,
  observations: String,
  referenceMarche: String,
  avisMunicipalite: String,
  numeroDeliberation: String,
  dateDeliberation: Date,
  nomSignataire: String,
  montantPrecompter: Number,
  typeBien: { type: String, enum: ['immobilier', 'mobilier', 'incorporel'] },
  projetId: Number,
  personnelId: Number,
  sourceDocumentHash: String,
  sourceImportKey: String,
  ...ts,
});
MandatSchema.index({ sourceImportKey: 1 }, { unique: true, sparse: true });
export const MandatModel = m('Mandat', MandatSchema);

// ─── BordereauMandat ─────────────────────────────────────────────────────────

const BordereauMandatSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  numero: Number,
  exercice: Number,
  dateEmission: Date,
  mairieId: Number,
  montantTotal: Number,
  totalPrecedent: Number,
  nombreMandats: Number,
  statut: { type: String, enum: ['ouvert', 'ferme'] },
  observations: String,
  personnelId: Number,
  ...ts,
});
export const BordereauMandatModel = m('BordereauMandat', BordereauMandatSchema);

// ─── EtatFinancierMensuel ─────────────────────────────────────────────────────

const efmFields: Record<string, unknown> = {};
for (let i = 1; i <= 12; i++) {
  efmFields[`ant${i}`] = { type: Number, default: 0 };
  efmFields[`dep${i}`] = { type: Number, default: 0 };
}

const EtatFinancierMensuelSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  annee: Number,
  sousChapitreId: Number,
  chapitreId: Number,
  sousChapitreCode: String,
  chapitreCode: String,
  mairieId: Number,
  ...efmFields,
  ...ts,
});
EtatFinancierMensuelSchema.index({ annee: 1, sousChapitreId: 1, chapitreId: 1 });
export const EtatFinancierMensuelModel = m('EtatFinancierMensuel', EtatFinancierMensuelSchema);

// ─── BordereauRecette ────────────────────────────────────────────────────────

const BordereauRecetteSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  numero: Number,
  annee: Number,
  mairieId: Number,
  montantTotal: Number,
  totalPrecedent: Number,
  nombreDeclarations: Number,
  dateTransmission: Date,
  statut: { type: String, enum: ['ouvert', 'ferme'] },
  observations: String,
  personnelId: Number,
  sourceDocumentHash: String,
  ...ts,
});
BordereauRecetteSchema.index({ mairieId: 1, annee: 1, numero: 1 }, { unique: true });
export const BordereauRecetteModel = m('BordereauRecette', BordereauRecetteSchema);

// ─── Declaration ─────────────────────────────────────────────────────────────

const DeclarationSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  exercice: Number,
  numeroPiece: Schema.Types.Mixed,
  dateDeclaration: Date,
  dateEncaissement: Date,
  bordereauRecetteId: Number,
  bordereauId: Number,
  taxeId: Number,
  mairieId: Number,
  contribuable: String,
  nomPartieVersante: String,
  adresse: String,
  numeroLivre: String,
  numeroEncaissement: String,
  montant: Number,
  montantRecette: Number,
  patrimonial: String,
  modePaiement: { type: String, enum: ['especes', 'cheque', 'virement', 'autre'] },
  statut: { type: String, enum: ['brouillon', 'validee', 'annulee'] },
  observations: String,
  personnelId: Number,
  sourceDocumentHash: String,
  sourceImportKey: String,
  ...ts,
});
DeclarationSchema.index({ sourceImportKey: 1 }, { unique: true, sparse: true });
export const DeclarationModel = m('Declaration', DeclarationSchema);

// ─── PrevisionRecette ────────────────────────────────────────────────────────

const PrevisionRecetteSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  exercice: Number,
  taxeId: Number,
  mairieId: Number,
  montantPrevu: Number,
  montantRealise: Number,
  statut: { type: String, enum: ['brouillon', 'validee'] },
  observations: String,
  personnelId: Number,
  ...ts,
});
export const PrevisionRecetteModel = m('PrevisionRecette', PrevisionRecetteSchema);

// ─── MandatRecette ───────────────────────────────────────────────────────────

const MandatRecetteSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  exercice: Number,
  numeroMandat: String,
  dateMandat: Date,
  chapitreId: Number,
  taxeId: Number,
  previsionRecetteId: Number,
  bordereauMandatRecetteId: Number,
  mairieId: Number,
  partieVersante: String,
  rib: String,
  patrimonial: String,
  objet: String,
  montant: Number,
  numeroFacture: String,
  dateFacture: Date,
  modePaiement: { type: String, enum: ['virement', 'cheque', 'especes', 'autre'] },
  statut: { type: String, enum: ['brouillon', 'paye', 'annule'] },
  observations: String,
  personnelId: Number,
  ...ts,
});
export const MandatRecetteModel = m('MandatRecette', MandatRecetteSchema);

// ─── BordereauMandatRecette ──────────────────────────────────────────────────

const BordereauMandatRecetteSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  numero: Number,
  exercice: Number,
  dateEmission: Date,
  mairieId: Number,
  montantTotal: Number,
  totalPrecedent: Number,
  nombreMandats: Number,
  statut: { type: String, enum: ['ouvert', 'ferme'] },
  observations: String,
  personnelId: Number,
  ...ts,
});
export const BordereauMandatRecetteModel = m(
  'BordereauMandatRecette',
  BordereauMandatRecetteSchema,
);

// ─── ChapitreRecette ─────────────────────────────────────────────────────────

const ChapitreRecetteSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  code: String,
  libelle: String,
  description: String,
  mairieId: Number,
  actif: Boolean,
  ...ts,
});
export const ChapitreRecetteModel = m('ChapitreRecette', ChapitreRecetteSchema);

// ─── EtatFinancierMensuelRecette ─────────────────────────────────────────────

const efmrFields: Record<string, unknown> = {};
for (let i = 1; i <= 12; i++) {
  efmrFields[`ant${i}`] = { type: Number, default: 0 };
  efmrFields[`rec${i}`] = { type: Number, default: 0 };
}

const EtatFinancierMensuelRecetteSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  annee: Number,
  taxeId: Number,
  chapitreRecetteId: Number,
  taxeCode: String,
  chapitreRecetteCode: String,
  mairieId: Number,
  ...efmrFields,
  ...ts,
});
EtatFinancierMensuelRecetteSchema.index({ annee: 1, taxeId: 1, chapitreRecetteId: 1 });
export const EtatFinancierMensuelRecetteModel = m(
  'EtatFinancierMensuelRecette',
  EtatFinancierMensuelRecetteSchema,
);

// ─── Employe ─────────────────────────────────────────────────────────────────

const EmployeSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  matricule: String,
  nom: String,
  prenom: String,
  dateNaissance: Date,
  sexe: { type: String, enum: ['M', 'F'] },
  typeEmploye: String,
  poste: String,
  grade: String,
  categorie: String,
  service: String,
  departement: String,
  dateEmbauche: Date,
  dateDepart: Date,
  typeSalarieCnps: String,
  regimeCnps: String,
  salaireBase: Number,
  indemniteLogement: Number,
  indemniteTransport: Number,
  autresIndemnites: Number,
  numeroCNPS: String,
  rib: String,
  banqueId: Number,
  mairieId: Number,
  actif: Boolean,
  observations: String,
  ...ts,
});
export const EmployeModel = m('Employe', EmployeSchema);

// ─── FichePaie ───────────────────────────────────────────────────────────────

const FichePaieSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  employeId: Number,
  mois: Number,
  annee: Number,
  exercice: Number,
  mairieId: Number,
  salaireBase: Number,
  indemniteLogement: Number,
  indemniteTransport: Number,
  autresIndemnites: Number,
  montantBrut: Number,
  cotisationCNPS: Number,
  impotSurSalaire: Number,
  autresRetenues: Number,
  montantNet: Number,
  statut: { type: String, enum: ['brouillon', 'valide', 'paye'] },
  mandatId: Number,
  observations: String,
  personnelId: Number,
  ...ts,
});
FichePaieSchema.index({ annee: 1, mois: 1, employeId: 1 });
export const FichePaieModel = m('FichePaie', FichePaieSchema);

// ─── Conge ───────────────────────────────────────────────────────────────────

const CongeSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  employeId: Number,
  mairieId: Number,
  type: { type: String, enum: ['annuel', 'maladie', 'maternite', 'circonstance', 'autre'] },
  dateDebut: Date,
  dateFin: Date,
  nombreJours: Number,
  motif: String,
  statut: { type: String, enum: ['demande', 'approuve', 'refuse', 'annule'] },
  observations: String,
  personnelId: Number,
  ...ts,
});
export const CongeModel = m('Conge', CongeSchema);

// ─── OrdreMission ────────────────────────────────────────────────────────────

const OrdreMissionSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  numero: String,
  employeId: Number,
  mairieId: Number,
  exercice: Number,
  objet: String,
  destination: String,
  dateDebut: Date,
  dateFin: Date,
  nombreJours: Number,
  indemniteJournaliere: Number,
  fraisTransport: Number,
  fraisHebergement: Number,
  fraisNourriture: Number,
  montantTotal: Number,
  mandatId: Number,
  statut: { type: String, enum: ['brouillon', 'valide', 'paye'] },
  observations: String,
  hebergementAssure: Boolean,
  nourritureAssuree: Boolean,
  moyenTransport: String,
  personnelId: Number,
  ...ts,
});
export const OrdreMissionModel = m('OrdreMission', OrdreMissionSchema);

// ─── ParametresPaie ──────────────────────────────────────────────────────────

const ParametresPaieSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  mairieId: Number,
  tauxCnpsEmploye: Number,
  tauxIts: Number,
  tauxFns: Number,
  tauxIndemniteResidence: Number,
  tauxCnpsPatronalPrestationFamiliale: Number,
  tauxCnpsPatronalAccidentTravail: Number,
  tauxCnpsPatronalRetraite: Number,
  abattementCN: Number,
  tauxIgr: { type: Number, default: 0 },
  plafondCnpsPfAt: { type: Number, default: 70000 },
  plafondCnpsRetraite: { type: Number, default: 3375000 },
  updatedAt: { type: Date, default: Date.now },
});
export const ParametresPaieModel = m('ParametresPaie', ParametresPaieSchema);

// ─── ServiceApp7 ─────────────────────────────────────────────────────────────

const ServiceApp7Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  nom: String,
  compte: String,
  chapitre: String,
  mairieId: Number,
  actif: Boolean,
  ...ts,
});
export const ServiceApp7Model = m('ServiceApp7', ServiceApp7Schema);

// ─── PrintData ───────────────────────────────────────────────────────────────

const PrintDataSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  type: String,
  data: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});
export const PrintDataModel = m('PrintData', PrintDataSchema);

// ─── Exercice ────────────────────────────────────────────────────────────────

const ExerciceSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  annee: Number,
  libelle: String,
  statut: { type: String, enum: ['ouvert', 'verrouille'] },
  mairieId: Number,
  dateOuverture: Date,
  dateVerrouillage: Date,
  observations: String,
  ...ts,
});
export const ExerciceModel = m('Exercice', ExerciceSchema);

// ─── Fournisseur ─────────────────────────────────────────────────────────────

const FournisseurSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  nom: String,
  sigle: String,
  compteContribuable: String,
  registreCommerce: String,
  compteBancaire: String,
  banqueId: Number,
  telephone: String,
  email: String,
  siege: String,
  mairieId: Number,
  actif: Boolean,
  observations: String,
  ...ts,
});
FournisseurSchema.index({ compteContribuable: 1 });
export const FournisseurModel = m('Fournisseur', FournisseurSchema);

// ─── Banque ──────────────────────────────────────────────────────────────────

const BanqueSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  code: String,
  nom: String,
  description: String,
  ...ts,
});
BanqueSchema.index({ code: 1 });
export const BanqueModel = m('Banque', BanqueSchema);

// ─── Registry (collection name → model) ─────────────────────────────────────

export const MODEL_REGISTRY: Record<string, mongoose.Model<mongoose.AnyObject>> = {
  mairies: MairieModel,
  utilisateurs: UtilisateurModel,
  taxes: TaxeModel,
  chapitres: ChapitreModel,
  sousChapitres: SousChapitreModel,
  previsions: PrevisionModel,
  mandats: MandatModel,
  bordereauMandats: BordereauMandatModel,
  etatFinancierMensuel: EtatFinancierMensuelModel,
  bordereauxRecette: BordereauRecetteModel,
  declarations: DeclarationModel,
  previsionsRecettes: PrevisionRecetteModel,
  mandatsRecette: MandatRecetteModel,
  bordereauMandatsRecette: BordereauMandatRecetteModel,
  chapitresRecette: ChapitreRecetteModel,
  etatFinancierMensuelRecette: EtatFinancierMensuelRecetteModel,
  employes: EmployeModel,
  fichesPaie: FichePaieModel,
  conges: CongeModel,
  ordresMission: OrdreMissionModel,
  parametresPaie: ParametresPaieModel,
  servicesApp7: ServiceApp7Model,
  printData: PrintDataModel,
  exercices: ExerciceModel,
  projets: ProjetModel,
  fournisseurs: FournisseurModel,
  banques: BanqueModel,
};
