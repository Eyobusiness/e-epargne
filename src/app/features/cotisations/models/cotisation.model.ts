import { Adherent } from '../../adherents/models/adherent.model';

export interface Cotisation {
  id?: string;
  periodicite: string;
  montant: number;
  adherent_id?: string;
  status?: string;
  date_debut: string;
  date_fin: string;
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
  periodicite: string;
  montant: number;
  adherent_id?: string;
  date_debut: string;
  date_fin: string;
}


export interface UpdateCotisationPayload {
  periodicite?: string;
  montant?: number;
  adherent_id?: string;
  status?: string;
  date_debut?: string;
  date_fin?: string;
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
