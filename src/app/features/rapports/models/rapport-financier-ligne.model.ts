export interface RapportFinancierLigne {

  id: string;

  date: string;

  type: string;

  adherent: string;

  montant: number;

  statut: string;

  moyenPaiement?: string;

  description?: string;

}