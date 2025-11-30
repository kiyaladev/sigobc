export type DenominationsType = {
  100: number;
  200: number;
  300: number;
  500: number;
  600: number;
  1000: number;
  [key: number]: number;
};

export interface SectionIEntry {
  id: number;
  date: string;
  type: string;
  denominations: DenominationsType;
  detailsQuotites?: Record<string, number>;
  approvisionnement?: number;
  remise?: number;
  solde: number;
}

export interface SectionIIEntry {
  id: number;
  date: string;
  type: string;
  denominations: DenominationsType;
  detailsQuotites?: Record<string, number>;
  remise?: number;
  versement?: number;
  solde: number;
}

export interface SectionIIIEntry {
  id: number;
  date: string;
  type: string;
  denominations: DenominationsType;
  detailsQuotites?: Record<string, number>;
  approvisionnement?: number;
  remise?: number;
  versement?: number;
  solde: number;
}

export type AnySectionEntry = SectionIEntry | SectionIIEntry | SectionIIIEntry;
