// ═══════════════════════════════════════════════════════════
//  Collection – Modèle de données (réponse réelle de l'API)
//
//  Workflow statuts :
//    100 → En attente   (POST /collections par l'agent collecteur)
//    200 → Validé       (PUT  /:id/activate  par l'admin)
//    300 → Rejeté       (PUT  /:id/deactivate par l'admin)
//    400 → Supprimé
// ═══════════════════════════════════════════════════════════

export type CollectionStatus = '100' | '110' | '200' | '300' | '400';

/** Objet Agent embarqué dans la réponse */
export interface CollectionAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  code: string;
  profil_id?: string | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/** Une collecte telle que renvoyée par l'API */
export interface Collection {
  id: string;
  amount: number;          // ← "amount" (pas "montant") dans l'API
  agent_id: string;
  status: CollectionStatus | string;
  user_action?: string | null;
  user_create_id?: string | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  agent?: CollectionAgent | null;   // objet agent embarqué
}

export interface CollectionListResponse {
  statusCode: number;
  statusMessage: string;
  data: { items: Collection[] };
  meta: {
    total: number;
    current: number;
    limit: number;
    previous: number | null;
    next: number | null;
  };
}

export interface CollectionParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  adherentId?: string;
  status?: string;
  agentId?: string;
}

/** Payload POST /collections (soumis par l'agent collecteur → status 100) */
export interface CreateCollectionDto {
  id: string;       // id de l'adhérent
  amount: number;   // montant collecté
  agent_id: string; // id de l'agent collecteur
}
