import { Adherent } from '../../adherents/models/adherent.model';

export interface Cotisation {
  id?: string;
  description?: string;
  periodicite: string;
  montant: number;
  adherent_id?: string;
  status?: string;
  date_debut: string;
  date_fin: string;
  commission_cycle_enabled?: boolean;
  commission_mode?: string;
  commission_valeur?: number;
  commission_cycle_size?: number;
  adherent?: Adherent;
  created_at?: string;
  updated_at?: string;
}


export interface PaginatedMeta {
  total: number;
  current: number;
  limit: number;
  previous: number | null;
  next: number | null;
}

export interface CotisationListResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    items: Cotisation[];
  };
  meta: PaginatedMeta;
}

export interface CreateCotisationPayload {
  description?: string;
  periodicite: string;
  montant: number;
  adherent_id?: string;
  date_debut: string;
  date_fin: string;
  commission_cycle_enabled?: boolean;
  commission_mode?: string;
  commission_valeur?: number;
  commission_cycle_size?: number;
}


export interface UpdateCotisationPayload {
  description?: string;
  periodicite?: string;
  montant?: number;
  adherent_id?: string;
  status?: string;
  date_debut?: string;
  date_fin?: string;
  commission_cycle_enabled?: boolean;
  commission_mode?: string;
  commission_valeur?: number;
  commission_cycle_size?: number;
}


export interface SubscriptionListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  adherentId?: string;
  status: string;
}
