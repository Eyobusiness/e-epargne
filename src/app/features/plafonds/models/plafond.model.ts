import { User, Profil } from '../../utilisateurs/models/utilisateur.model';

export interface Plafond {
  id?: string;
  name: string;
  amount: number | null;
  description: string;
  status?: string;
  user_action?: string | null;
  user_create_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CollectorLimit {
  id?: string;
  plafond_id: string;
  agent_id: string | null;
  profil_id: string | null;
  status?: string;
  user_action?: string | null;
  user_create_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  plafond?: Plafond;
  agent?: User | null;
  profil?: Profil | null;
  collected_amount?: number;
  current_amount?: number;
  total_collecte?: number;
  montantCollecte?: number;
  montantRestant?: number;
  tauxUtilisation?: number;
  last_plafond_reset_at?: string;
  lastPlafondResetAt?: string;
}
