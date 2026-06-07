import { CategorieDepense } from './categorie-depense.model';

export interface DepenseDocument {
  id?: number;
  extension?: string;
  parent?: string;
  numero?: string;
  type?: string;
  validite?: string;
  lien?: string;
  parent_id?: string;
}

export interface Depense {
  id?: string;
  categorie_depense_id: string;
  amount: number;
  date_depense?: string;
  description: string;
  status?: string;
  user_action?: string | null;
  synchronize_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  categorie?: CategorieDepense;
  document?: DepenseDocument | null;
}

export interface DepensePayload {
  categorie_depense_id: string;
  description: string;
  amount: number;
  date_depense: string;
  document?: DepenseDocument;
}

export interface PaginatedMeta {
  total: number;
  current: number;
  limit: number;
  previous: number | null;
  next: number | null;
}

export interface DepenseListResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    items: Depense[];
  };
  meta: PaginatedMeta;
}

export interface DepenseItemResponse {
  statusCode: number;
  statusMessage: string;
  data: Depense;
}
