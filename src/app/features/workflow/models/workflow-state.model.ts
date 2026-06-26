export interface WorkflowState {
  id?: string;

  name: string;

  beforeStep?: string;

  description?: string;

  parent?: string;

  status?: string;

  created_at?: string;

  updated_at?: string;

  deleted_at?: string | null;
}
