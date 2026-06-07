export interface DocumentIdentite {
  id?: string;
  type: string;
  lien?: string;
  extension?: string;
  numero?: string | null;
  validite?: string | null;
  parent?: string | null;
  parent_id?: string;
  readUrl?: string;
  user_action?: string | null;
  synchronize_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface MemberDocumentPayload {
  extension: string;
  numero?: string;
  type: string;
  validite?: string;
  lien: string;
  parent?: string;
  parent_id?: string;
}
