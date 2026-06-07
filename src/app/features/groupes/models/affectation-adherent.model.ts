import { Adherent } from '../../adherents/models/adherent.model';
import { Groupe, PaginatedMeta, normalizeGroupe } from './groupe.model';

export interface AffectationAdherent {
  id?: string;
  groupe_id: string;
  adherent_id?: string;
  adherent_ids?: string[];
  groupe?: Groupe;
  adherent?: Adherent;
  status?: string;
  user_action?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface AffectationAdherentListResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    items: AffectationAdherent[];
  };
  meta: PaginatedMeta;
}

export interface CreateAffectationAdherentPayload {
  id?: string | null;
  groupe_id: string;
  adherent_id: string;
}

export interface UpdateAffectationAdherentPayload
  extends Partial<CreateAffectationAdherentPayload> {
  status?: string;
}

export function normalizeAffectationAdherent(
  source: Partial<AffectationAdherent>,
): AffectationAdherent {
  return {
    id: source.id,
    groupe_id: source.groupe_id ?? source.groupe?.id ?? '',
    adherent_id: source.adherent_id ?? source.adherent?.id,
    adherent_ids: source.adherent_ids,
    groupe: source.groupe ? normalizeGroupe(source.groupe) : undefined,
    adherent: source.adherent,
    status: source.status ?? '200',
    user_action: source.user_action ?? null,
    created_at: source.created_at,
    updated_at: source.updated_at,
    deleted_at: source.deleted_at ?? null,
  };
}
