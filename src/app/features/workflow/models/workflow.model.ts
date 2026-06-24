export interface Workflow {
  id?: string;

  label: string;

  endpoint: string;

  description?: string;

  status?: string;

  created_at?: string;

  updated_at?: string;

  deleted_at?: string | null;
}
