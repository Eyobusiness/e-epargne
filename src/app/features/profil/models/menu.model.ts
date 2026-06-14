export interface SubMenu {
  id?: string;

  menu_id?: string;

  name?: string;

  path?: string;

  icon?: string;

  code?: string;

  status?: string;

  permission?: string;
}

export interface Menu {
  id?: string;

  libelle?: string;

  order?: number;

  permission?: string;

  sousMenus?: SubMenu[];

  checked?: boolean;

  selectedPermission?: string;
}