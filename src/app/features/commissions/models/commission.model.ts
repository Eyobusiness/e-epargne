export interface CommissionConfig {
  id: string;
  type_operation: 'DEPOT' | 'RETRAIT';
  mode_commission: 'FIXED' | 'PERCENT';
  valeur: number;
  montant_min?: number;
  montant_max?: number;
  libelle?: string;
  status: string; // '200' = Actif, '300' = Inactif
}

export interface CreateCommissionConfigDto {
  type_operation: 'DEPOT' | 'RETRAIT';
  mode_commission: 'FIXED' | 'PERCENT';
  valeur: number;
  montant_min?: number;
  montant_max?: number;
  libelle?: string;
}

export interface UpdateCommissionConfigDto {
  type_operation?: 'DEPOT' | 'RETRAIT';
  mode_commission?: 'FIXED' | 'PERCENT';
  valeur?: number;
  montant_min?: number;
  montant_max?: number;
  libelle?: string;
}

export interface PreviewCommissionDto {
  type_operation: 'DEPOT' | 'RETRAIT';
  montant: number;
}
