export interface MarkingZoneDTO {
  id?: number;
  nom: string;
  masquePng: string;
  zoomActive: boolean;
  defaultXPercent: number;
  defaultYPercent: number;
  defaultScalePercent: number;
  paddingPercent: number;
  displayOrder: number;
}

export interface ProductColorisDTO {
  id: number;
  nom: string;
  codeHex: string | null;
  imageProduit: string;
  couleurMasquePng?: string;
  imageBaseBlanc?: string;
  couleurPersonnalisable?: boolean;
  actif: boolean;
  displayOrder: number;
}
export interface MockupLogoDTO {
  id?: number;
  nomOriginal: string;
  nomFichierStocke: string;
  publicPath: string;
  mimeType: string;
  extension: string;
  isVector: boolean;
  typeApercu: string;
  dateImport?: string;
}

export interface CouleurDetecteeDTO {
  id?: number;
  nom: string;
  codeHex: string;
  cmykC?: number;
  cmykM?: number;
  cmykY?: number;
  cmykK?: number;
  source: 'detected' | 'manual';
}

export interface MockupProjectDTO {
  id?: number;
  nomProjet: string;
  statut: 'brouillon' | 'finalise';
  logos: MockupLogoDTO[];
  logoPrincipalId?: string;
  produitsSelectionnes: number[];
  colorisSelectionnes: number[];
  couleurs: CouleurDetecteeDTO[]; // reçu comme array après désérialisation
  brouillonMaquette?: string;
  dateMiseAJour?: string;
  clientRef?: string;
  ownerEmail?: string;
  ownerNom?: string;
  ownerPrenom?: string;
}

export interface MockupProjectRequestDTO {
  nomProjet: string;
  produitsSelectionnes: number[];
  colorisSelectionnes: number[];
  couleurs?: string; // envoyé comme JSON string
  brouillonMaquette?: string;
  logoPrincipalId?: string;
  clientRef?: string;
}

