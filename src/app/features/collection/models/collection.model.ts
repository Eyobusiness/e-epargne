import { User } from '../../utilisateurs/models/utilisateur.model';

export interface Collection {
  id: string;
  amount: number;
  agent_id: string;
  status: string;
  user_action?: string | null;
  user_create_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  agent?: User | null;
}
