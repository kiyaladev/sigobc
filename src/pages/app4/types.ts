export interface RawSectionIEntry {
  id: number;
  date: string;
  type: string;
  detailsQuotites: Record<string, number>;
  approvisionnement?: number;
  remise?: number;
}

export interface SectionIEntry extends RawSectionIEntry {
  solde: number;
}

export interface RawSectionIIEntry {
  id: number;
  date: string;
  type: string;
  detailsQuotites: Record<string, number>;
  remise?: number;
  versement?: number;
}

export interface SectionIIEntry extends RawSectionIIEntry {
  solde: number;
}

export interface RawSectionIIIEntry {
  id: number;
  date: string;
  type: string;
  detailsQuotites: Record<string, number>;
  approvisionnement?: number;
  remise?: number;
  versement?: number;
}

export interface SectionIIIEntry extends RawSectionIIIEntry {
  solde: number;
}

export type AnySectionEntry = SectionIEntry | SectionIIEntry | SectionIIIEntry;
