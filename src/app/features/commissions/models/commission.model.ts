export interface CommissionConfig {
  id: string;
  type_operation: 'DEPOT' | 'RETRAIT';
  groupe_cotisation_id: string;
  montant_min: number;
  montant_max: number;
  mode_commission: 'PERCENT' | 'FIXED';
  valeur: number;
  libelle: string;
  status: string; // '200' = Actif, '300' = Inactif
  groupe_cotisation?: {
    id: string;
    name: string;
  };
}

export interface CreateCommissionConfigDto {
  type_operation: 'DEPOT' | 'RETRAIT';
  groupe_cotisation_id: string;
  mode_commission: 'PERCENT' | 'FIXED';
  valeur: number;
  libelle: string;
}

export interface UpdateCommissionConfigDto {
  type_operation?: 'DEPOT' | 'RETRAIT';
  groupe_cotisation_id?: string;
  mode_commission?: 'PERCENT' | 'FIXED';
  valeur?: number;
  libelle?: string;
}

export interface PreviewCommissionDto {
  type_operation: 'DEPOT' | 'RETRAIT';
  montant: number;
}
