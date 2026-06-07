export interface PaginatedMeta {
  total: number;
  previous: number | null;
  next: number | null;
  current: number;
  limit: number;
}

export interface Groupe {
  id?: string;
  name: string;
  label: string;
  description?: string | null;
  montant_min: number;
  montant_max: number;
  montant: number;
  status?: string;
  user_action?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface GroupeListResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    items: Groupe[];
  };
  meta: PaginatedMeta;
}

export interface CreateGroupePayload {
  id?: string | number | null;
  name: string;
  description?: string | null;
  montant_min: number;
  montant_max: number;
}

export interface UpdateGroupePayload extends Partial<CreateGroupePayload> {
  status?: string;
}

export interface GroupeSource {
  id?: string | number | null;
  name?: string;
  label?: string;
  description?: string | null;
  montant_min?: number | null;
  montant_max?: number | null;
  montant?: number | null;
  status?: string;
  user_action?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export function normalizeGroupe(source: GroupeSource): Groupe {
  const name = source.name ?? source.label ?? '';
  const montantMax = Number(source.montant_max ?? source.montant ?? 0);

  return {
    id: source.id != null ? String(source.id) : undefined,
    name,
    label: name,
    description: source.description ?? null,
    montant_min: Number(source.montant_min ?? 0),
    montant_max: montantMax,
    montant: montantMax,
    status: source.status ?? '200',
    user_action: source.user_action ?? null,
    created_at: source.created_at,
    updated_at: source.updated_at,
    deleted_at: source.deleted_at ?? null,
  };
}

export function toGroupePayload(source: GroupeSource): CreateGroupePayload {
  return {
    ...(source.id != null ? { id: source.id } : {}),
    name: source.name ?? source.label ?? '',
    description: source.description ?? null,
    montant_min: Number(source.montant_min ?? 0),
    montant_max: Number(source.montant_max ?? source.montant ?? 0),
  };
}
