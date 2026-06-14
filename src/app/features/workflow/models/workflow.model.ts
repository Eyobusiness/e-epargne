export interface Workflow {
  id?: string;

  endpoint: string;

  label: string;

  description?: string;

  status?: string;

  parent?: string;

  created_at?: string;

  updated_at?: string;

  deleted_at?: string | null;
}

export interface WorkflowListResponse {
  items: Workflow[];
}
