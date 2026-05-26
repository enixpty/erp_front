import { Component, computed, inject, signal, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';

import { Customtable } from '@src/app/components/customTable/customtable';
import { CustomModal } from '@src/app/components/custom-modal/custom-modal';
import { MenuServices } from '@src/app/services/menu';
import { LvalService } from '@src/app/services/lval.service';

interface Menu {
  id: number | null;
  name: string;
  path: string;
  icon: string;
  order: number;
  status: string;
  status_name?: string;
  parent: number | null;
  parent_name?: string;
  created: string;
  modified: string;
}

@Component({
  selector: 'app-list-menu',
  standalone: true,
  imports: [CardModule, InputTextModule, Select, Toast, 
            ButtonModule, FormsModule, MessageModule, Customtable, CustomModal],
  templateUrl: './list-menu.html',
  styleUrl: './list-menu.css'
})
export class ListMenu implements OnInit {
  @ViewChild('menusTable') customTableComponent!: Customtable;
  private messageService = inject(MessageService);
  private lvalService = inject(LvalService);
  menus = inject(MenuServices);

  isVisible = signal<boolean>(false);
  delVisible = signal<boolean>(false);
  
  statusOptions = signal<any[]>([]);
  menuOptions = signal<any[]>([]);
  selectedStatus: any | undefined;
  selectedParent: any | undefined;
  
  formSubmitted = signal(false);

  readonly isNameRequired = computed(() => {
    return this.formSubmitted() && this.selectedMenu().name.trim().length == 0;
  });

  readonly isIconRequired = computed(() => {
    return this.formSubmitted() && this.selectedMenu().icon.trim().length == 0;
  });

  readonly isOrderRequired = computed(() => {
    return this.formSubmitted() && (this.selectedMenu().order === null);
  });

  readonly isStatusRequired = computed(() => {
    return this.formSubmitted() && this.selectedStatus == null;
  });

  readonly isFormInvalid = computed(() => {
    return this.isNameRequired() || this.isIconRequired() || this.isOrderRequired() || this.isStatusRequired();
  });

  cols = [
    { field: 'id', header: 'Id', order: true, filter: true },
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'parent_name', header: 'Padre', order: true, filter: true },
    { field: 'order', header: 'Orden', order: true, filter: true },
    { field: 'status_name', header: 'Estado', order: true, filter: true },
    { field: 'path', header: 'Ruta', order: true, filter: true },
    { field: 'icon', header: 'Icono', order: true, filter: true },
    { field: 'action', header: '', order: false, filter: false }
  ];

  ngOnInit() {
    this.loadStatusOptions();
    this.menus.get_menus({}).subscribe(data => this.menuOptions.set(data.results || data));
  }

  loadStatusOptions() {
    this.lvalService.listLvals('STD').subscribe({
      next: (data) => {
        debugger
        this.statusOptions.set(data);
        if (!this.selectedMenu().id) {
          this.selectedStatus = data.find(s => s.value === '1');
        }
      },
      error: (err: any) => console.error('Error loading status options', err)
    });
  }

  selectedMenu = signal<Menu>({
    id: null,
    name: '',
    path: '',
    icon: '',
    order: 0,
    status: '1',
    parent: null,
    created: '',
    modified: ''
  });

  selectedDelete = signal<Menu>({
    id: null,
    name: '',
    path: '',
    icon: '',
    order: 0,
    status: '1',
    parent: null,
    created: '',
    modified: ''
  });
  delExit() {
    this.isVisible.set(false);
    this.delVisible.set(false);
  }
  handDelete() {
    this.menus.del_menu(this.selectedDelete().id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Menú eliminado' });
        this.forzarRefrescoDesdePadre();
        this.delVisible.set(false);
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
      }
    });
  }

  handEdit() {
    this.selectedMenu().status = this.selectedStatus?.value;
    this.selectedMenu().parent = this.selectedParent?.id || null;
    this.formSubmitted.set(true);
    if (this.isFormInvalid()) return;

    const action = this.selectedMenu().id
        ? this.menus.up_menu(this.selectedMenu())
        : this.menus.create_menu(this.selectedMenu());

    action.subscribe({      next: () => {
        this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: this.selectedMenu().id ? 'Menú actualizado' : 'Menú registrado' 
        });
        this.isVisible.set(false);
        this.forzarRefrescoDesdePadre();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
      }
    });
  }

  handleEdit(data: any) {
    this.menus.get_all_active().subscribe(menusData => {
      this.menuOptions.set(menusData);
      this.selectedMenu.set({ ...data });
      this.selectedStatus = this.statusOptions().find(c => c.value === data.status);
      this.selectedParent = this.menuOptions().find(m => m.id === data.parent);
      this.isVisible.set(true);
    });
  }

  handleDelete(data: any) {
    this.selectedDelete.set(data);
    this.delVisible.set(true);
  }

  forzarRefrescoDesdePadre() {
    if (this.customTableComponent) {
      this.customTableComponent.onRefresh();
    }
  }

  openNew() {
    this.menus.get_all_active().subscribe(menusData => {
      this.menuOptions.set(menusData);
      this.selectedMenu.set({
        id: null,
        name: '',
        path: '',
        icon: '',
        order: 0,
        status: '1',
        parent: null,
        created: '',
        modified: ''
      });
      this.selectedStatus = this.statusOptions().find(s => s.value === '1');
      this.selectedParent = undefined;
      this.formSubmitted.set(false);
      this.isVisible.set(true);
    });
  }
}
