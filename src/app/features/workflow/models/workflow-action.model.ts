export interface WorkflowAction {
  id?: string;

  endpoint: string;

  stepId: string;

  profileIds?: string[];

  idWorkflow: string;

  beforeStep: string;

  stateOrder: string;

  notification?: string;

  nextField?: string;

  parent?: string;

  profileId?: string;

  profile?: {
    id: string;
    name: string;
  };

  created_at?: string;

  updated_at?: string;

  deleted_at?: string | null;
}
