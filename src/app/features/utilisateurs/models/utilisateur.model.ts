export interface Profil {
  id: string;
  name: string;
  permission: string;
  code: string;
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  profil_id: string | null;
  status: string;
  code: string;
  user_action: string | null;
  synchronize_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  refreshToken: string | null;
  profil: Profil | null;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  code: string;
  profil_id: string;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  phone: string;
  code: string;
  profil_id: string;
  status: string;
}
