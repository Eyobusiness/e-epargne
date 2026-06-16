export interface SessionUserProfil {
  id?: string;
  name?: string;
  libelle?: string;
  code?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email?: string;
  username?: string;
  phone?: string;
  profil_id?: string | null;
  profil?: SessionUserProfil | null;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}
