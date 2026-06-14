import { ProfileMenu } from './profil-menu.model';

export interface Profile {
  id?: string;

  libelle?: string;

  code?: string;

  permission?: string;

  profilMenus?: ProfileMenu[];
}