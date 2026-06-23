
import {RapportFinancierLigne} from'../models/rapport-financier-ligne.model';
export interface RapportFinancier {
  totalDepotPrevu: number;

  totalDepotPaye: number;

  totalDepotEnAttente: number;

  totalDepotAnnule: number;

  totalRetrait: number;

  totalDepense: number;

  totalCommission: 0;

  soldeDisponible: number;

  lignes?: RapportFinancierLigne[];
}


