import { Adherent } from '../../adherents/models/adherent.model';
import { Groupe } from '../../groupes/models/groupe.model';

export interface CotisationAdherent {

  id: string;

  montant: number;

  description?: string | null;

  status: string;

  periodicite: string;

  adherent_id: string;

  cotisation_id: string;

  date_cotisation: string;

  date_paiement?: string | null;

  moyen_paiement?: string | null;

  user_action?: string | null;

  user_create_id?: string | null;

  created_at: string;

  updated_at: string;

  deleted_at?: string | null;

  adherent?: Adherent;

  groupe_cotisation?: Groupe;

}

export interface CotisationAdherentListResponse {

  statusCode: number;

  statusMessage: string;

  data: {
    items: CotisationAdherent[];
  };

  meta: {
    total: number;
    current: number;
    limit: number;
    previous: number | null;
    next: number | null;
  };

}

export interface CreateCotisationAdherentPayload {

  adherent_id: string;

  cotisation_id: string;

  montant: number;

  periodicite: string;

  date_cotisation: string;

  description?: string;

}

export interface UpdateCotisationAdherentPayload {

  montant?: number;

  periodicite?: string;

  date_cotisation?: string;

  date_paiement?: string;

  moyen_paiement?: string;

  description?: string;

  status?: string;

}

export interface GenerateCotisationAdherentPayload {

  adherentId?: string;

  startDate: string;

  endDate: string;

}

export interface SubscriptionMemberListParams {

  page?: number;

  limit?: number;

  search?: string;

  sort?: string;

  order?: 'asc' | 'desc';

  startDate?: string;

  endDate?: string;

  adherentId?: string;

  status?: string;

}