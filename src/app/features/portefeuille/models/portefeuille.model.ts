import { Adherent } from '../../adherents/models/adherent.model';

export interface Portefeuille {
  id?: string;

  montant?: number;

  type_compte?: string;

  event?: string;

  event_id?: string;

  adherent_id?: string;

  user_action?: string | null;

  user_create_id?: string | null;

  created_at?: string;

  updated_at?: string;

  deleted_at?: string | null;

  adherent?: Adherent;
}
