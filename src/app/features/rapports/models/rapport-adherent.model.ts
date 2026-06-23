export interface RapportAdherent {
  adherentId: string;

  matricule: string;

  nom: string;

  telephone: string;

  groupeId: string;

  groupe: string;

  montantPrevu: number;

  montantPaye: number;

  montantReste: number;

  tauxRealisation: number;

  periodicite?: string;

  statut?: string;
}
