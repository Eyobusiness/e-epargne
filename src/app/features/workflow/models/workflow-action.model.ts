export interface WorkflowAction {
  id?: string;

  idWorkflow: string;

  stepId: string;

  endpoint: string;

  beforeStep?: string;

  stateOrder?: string;

  profileIds?: string[];

  profileId?: string;

  notification?: string;

  parent?: string;

  nextField?: string;

  profile?: {
    id: string;
    name: string;
  };

  created_at?: string;

  updated_at?: string;

  deleted_at?: string | null;
}
