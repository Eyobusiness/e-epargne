export interface RapportGroupe {
  groupeId: string;

  groupe: string;

  nombreAdherents: number;

  totalPrevu: number;

  totalCotise: number;

  resteACotiser: number;

  tauxRealisation: number;

  classement?: number;
}
