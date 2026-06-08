export interface DashboardStats {
  totalRetrait: number;
  totalDepot: number;
  totalDepense: number;

  totalCommissionRetrait: number;
  soldeCommission: number;
  tauxCommissionRetrait: number;

  adherentActif: number;
  adherentInactif: number;

  monthlyTotalsByType: {
    DEPOT: Record<string, number>;
    RETRAIT: Record<string, number>;
  };
}
