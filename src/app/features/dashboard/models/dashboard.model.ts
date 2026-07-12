export interface DashboardStats {
  totalRetrait: number;

  totalDepot: number;

  totalDepotPaye: number;

  totalDepotEnAttente: number;

  totalDepotAnnule: number;
  
  Solde: number;

  totalDepense: number;

  totalCommission: number;

  soldeCommission: number;

  tauxCommission: number;

  adherentActif: number;

  adherentInactif: number;

  monthlyTotalsByType: {
    DEPOT: Record<string, number>;
    RETRAIT: Record<string, number>;
  };
}
