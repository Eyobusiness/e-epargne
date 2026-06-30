
export interface ClassementGroupe {
  rang: number;

  groupeId: string;

  groupe: string;

  nombreMembres: number;

  totalPrevu?: number;

  totalCotise: number;

  resteACotiser?: number;

  tauxRealisation: number;
}
