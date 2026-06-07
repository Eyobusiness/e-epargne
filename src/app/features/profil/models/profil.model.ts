import { ProfilMenu } from './menu.model';

export interface Profil {
  id: string;
  libelle: string;
  code: string;
  permission: string;
  profilMenus: ProfilMenu[];
}

export interface ProfilResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    items: Profil[];
  };
  meta: {
    total: number;
    previous: number | null;
    next: number | null;
    current: number;
    limit: number;
  };
}