import { DocumentIdentite, MemberDocumentPayload } from './document.model';

export interface Adherent {
  id?: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  password?: string;
  matricule?: string;
  status?: string;
  user_action?: string | null;
  synchronize_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  documents?: DocumentIdentite[];
}

export interface MemberListResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    items: Adherent[];
  };
  meta: {
    total: number;
    previous: number | null;
    next: number | null;
    current: number;
    limit: number;
  };
}

export interface MemberDetailResponse {
  adherent: Adherent;
  documents: DocumentIdentite[];
}

export interface CreateMemberPayload {
  name: string;

  phone: string;

  address: string;

  email: string;

  password: string;

  matricule: string;

  documents?: MemberDocumentPayload[];
}

export interface UpdateMemberPayload {
  name: string;

  phone: string;

  address: string;

  email: string;

  matricule: string;

  password?: string;

  documents?: MemberDocumentPayload[];
}
