import { PaginatedMeta } from './depense.model';

export interface CategorieDepense {
  id?: string;
  name: string;
  description: string;
  code: string;
  status?: string;
  user_action?: string | null;
  synchronize_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CategorieDepenseListResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    items: CategorieDepense[];
  };
  meta: PaginatedMeta;
}

export interface CategorieDepenseItemResponse {
  statusCode: number;
  statusMessage: string;
  data: CategorieDepense;
}
