// models/operation.model.ts

import { Adherent } from '../../adherents/models/adherent.model';

export interface Operation {
  id?: string;

  description?: string;

  moyen_operation: string;

  montant: number;

  adherent_id?: string;

  date_operation: string;

  status?: string;

  montant_commission?: number; // futur

  type_operation: string;

  compte?: string;

  motif?: string;

  cotisation_adherent_id?: string;

  adherent?: Adherent;

  created_at?: string;

  updated_at?: string;
}