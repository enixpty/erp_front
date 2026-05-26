import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { RoleList, Menu, MenuAssignment } from '@src/app/interfaces/menu.interface';
import { Checkbox } from 'primeng/checkbox';
import { RolesServices } from '@src/app/services/roles';
import { MenuServices } from '@src/app/services/menu';

// interface Role {
//   id: number;
//   name: string;
//   status: boolean;
// }

// interface Menu {
//   id: number;
//   name: string;
//   path: string;
//   icon: string;
//   active: boolean;
//   assigned?: boolean;
// }

// interface MenuAssignment {
//   roleId: number;
//   menuId: number;
// }

@Component({
  selector: 'app-menu-roles',
  imports: [CardModule, ButtonModule, FormsModule, Toast, Checkbox],
  templateUrl: './menu-roles.html',
  styleUrl: './menu-roles.css'
})
export class MenuRoles {
  private messageService = inject(MessageService);
  menuServices = inject(MenuServices);
  rolesServices = inject(RolesServices)
  typesev = signal<string>('');
  txtmessage = signal<string>('');
  txtitle = signal<string>('');
    // Signals
  roles = signal<RoleList[]>([]);
    menus = signal<Menu[]>([
    // { id: 1, name: 'Dashboard', path: '/home', icon: 'pi pi-home', active: true },
    // { id: 2, name: 'Usuarios', path: '/users', icon: 'pi pi-users', active: true },
    // { id: 3, name: 'Roles', path: '/roles', icon: 'pi pi-shield', active: true },
    // { id: 4, name: 'Menús', path: '/menus', icon: 'pi pi-list', active: true },
    // { id: 5, name: 'Colaboradores', path: '/collaborators', icon: 'pi pi-user-plus', active: true },
    // { id: 6, name: 'Marcaciones', path: '/records', icon: 'pi pi-clock', active: true }
  ]);
  ngOnInit() {
    this.rolesServices.get_roleslist().subscribe({
      next: (resp) => {
            // Signals
            // roles = signal<Role[]>([
            //   { id: 1, name: 'Administrador', is_active: true },
            //   { id: 2, name: 'Usuario', is_active: true },
            //   { id: 3, name: 'Supervisor', is_active: false }
            // ]);
             
            this.roles.set(resp);
      }, error: (err: any) => {
        this.txtitle.set('Error al cargar los Roles');
        this.typesev.set('error');
        this.txtmessage.set(err);
        this.triggerToast();
      }
    })

    this.menuServices.get_menulist().subscribe({
      next: (resp) => {
        // this.menus.set(resp);
        this.menus.set(resp.map((m: any) => {
          return {
            ...m,
            active: true
          }
        }));
         
      }, error: (err: any) => {
        this.txtitle.set('Error al cargar los Menús');
        this.typesev.set('error');
        this.txtmessage.set(err);
        this.triggerToast();
      }
    })
 
  }

  

  
  selectedRole = signal<RoleList | null>(null);
  originalAssignments = signal<number[]>([]);
  
  // Computed
  hasChanges = computed(() => {
    if (!this.selectedRole()) return false;
    
    const currentAssignments = this.menus()
      .filter(menu => menu.assigned)
      .map(menu => menu.id)
      .sort();
    
    const original = [...this.originalAssignments()].sort();
    
    return JSON.stringify(currentAssignments) !== JSON.stringify(original);
  });
  
  selectRole(role: RoleList) {
    this.selectedRole.set(role);
    this.loadMenuAssignments(role.id);


  }
  
  loadMenuAssignments(roleId: number) {
    // Simular carga de asignaciones desde el backend
    // En producción, aquí harías una llamada al servicio

    this.menuServices.get_menuxrole({ role_id: roleId }).subscribe({
      next: (resp) => {
        debugger
        const respData = resp; // Acceder a la propiedad 'data'

        // Convertir el array de objetos en un array de IDs
        const menuIds = respData.map((item: any) => item.menu);

        this.originalAssignments.set([...menuIds]);

        // Actualizar el estado de los menús
        this.menus.update(menus =>
          menus.map(menu => ({
            ...menu,
            assigned: menuIds.includes(menu.id)
          }))
        );

      }
    })
    // const mockAssignments = roleId === 1 ? [1, 2, 3, 4] : roleId === 2 ? [1, 6] : [1];
    
    // this.originalAssignments.set([...mockAssignments]);
    
    // // Actualizar el estado de los menús
    // this.menus.update(menus => 
    //   menus.map(menu => ({
    //     ...menu,
    //     assigned: mockAssignments.includes(menu.id)
    //   }))
    // );
  }
  
  onMenuToggle(menu: any, newValue: boolean) {
    this.menus.update(prevMenus => {
      return prevMenus.map(m => 
        m.id === menu.id ? { ...m, assigned: newValue } : m
      );
    });
  }
  
  selectAllMenus() {
    this.menus.update(menus => 
      menus.map(menu => ({ ...menu, assigned: true }))
    );
  }
  
  deselectAllMenus() {
    this.menus.update(menus => 
      menus.map(menu => ({ ...menu, assigned: false }))
    );
  }
  
  getSelectedMenusCount(): number {
    return this.menus().filter(menu => menu.assigned).length;
  }
  
  saveMenuAssignments() {

    debugger
    if (!this.selectedRole()) return;
    
    
    const selectedMenuIds = this.menus()
      .filter(menu => menu.assigned)
      .map(menu => menu.id);
    
    this.menuServices.assignmenu({
      role_id: this.selectedRole()!.id,
      menu_ids: selectedMenuIds
    }).subscribe({
      next: (resp) => {
        this.txtitle.set('Asignación de Menús');
        this.typesev.set('success');
        this.originalAssignments.set([...selectedMenuIds]);
        this.txtmessage.set('Los menús se han asignado correctamente al rol: '+this.selectedRole()!.name);
        this.triggerToast();
      }, error: (err: any) => {
        this.txtitle.set('Error al asignar los Menús');
        this.typesev.set('error');
        this.txtmessage.set(err);
        this.triggerToast();
      }
    })
    // // Aquí harías la llamada al backend para guardar las asignaciones
    // console.log('Guardando asignaciones:', {
    //   roleId: this.selectedRole()!.id,
    //   menuIds: selectedMenuIds
    // });
    
    // Actualizar las asignaciones originales
    // this.originalAssignments.set([...selectedMenuIds]);
    
    // Mostrar mensaje de éxito
    // this.messageService.add({
    //   severity: 'success',
    //   summary: 'Éxito',
    //   detail: 'Asignaciones guardadas correctamente'
    // });
  }
  triggerToast() {
    this.messageService.add({
      severity: this.typesev(),
      summary: this.txtitle(),
      detail: this.txtmessage()
    });
  }
}
