export interface RoleList {
  id: number;
  name: string;
  status: boolean;
}

export interface Menu {
  id: number;
  name: string;
  path: string;
  icon: string;
  active: boolean;
  assigned?: boolean;
}

export interface MenuAssignment {
  roleId: number;
  menuId: number;
}