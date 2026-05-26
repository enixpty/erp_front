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

import { Role } from '@src/app/interfaces/rol.interface';
import { RolesServices } from '@src/app/services/roles';
import { LvalService } from '@src/app/services/lval.service';

@Component({
  selector: 'app-list-roles',
  standalone: true,
  imports: [CardModule, InputTextModule, Select, Toast, 
            ButtonModule, FormsModule, MessageModule, Customtable, CustomModal],
  templateUrl: './list-roles.html',
  styleUrl: './list-roles.css',
})
export class ListRoles implements OnInit {
  @ViewChild('rolesTable') customTableComponent!: Customtable;
  private messageService = inject(MessageService);
  private lvalService = inject(LvalService);
  roles = inject(RolesServices);

  isVisible = signal<boolean>(false);
  delVisible = signal<boolean>(false);
  
  statusOptions = signal<any[]>([]);
  selectedStatus: any | undefined;
  
  formSubmitted = signal(false);

  readonly isNameRequired = computed(() => {
    return this.formSubmitted() && this.selectedRole().name.trim().length == 0;
  });

  readonly isStatusRequired = computed(() => {
    return this.formSubmitted() && this.selectedStatus == null;
  });

  readonly isFormInvalid = computed(() => {
    return this.isNameRequired() || this.isStatusRequired();
  });

  cols = [
    { field: 'id', header: 'Id', order: true, filter: true },
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'status_name', header: 'Estado', order: true, filter: true },
    { field: 'created', header: 'Fecha Creación', order: true, filter: true },
    { field: 'modified', header: 'Modificado', order: true, filter: true },
    { field: 'action', header: '', order: false, filter: false }
  ];

  selectedRole = signal<Role>({
    id: undefined,
    name: '',
    status: '1',
    created: '',
    modified: ''
  });

  selectedDelete = signal<Role>({
    id: undefined,
    name: '',
    status: '1',
    created: '',
    modified: ''
  });

  ngOnInit() {
    this.loadStatusOptions();
  }

  loadStatusOptions() {
    this.lvalService.listLvals('STD').subscribe({
      next: (data) => {
        this.statusOptions.set(data);
        if (!this.selectedRole().id) {
          this.selectedStatus = data.find(s => s.value === 'ACTIVE');
        }
      },
      error: (err: any) => console.error('Error loading status options', err)
    });
  }
  delExit() {
    this.isVisible.set(false);
    this.delVisible.set(false);
  }
  handDelete() {
    this.roles.del_role(this.selectedDelete().id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado' });
        this.forzarRefrescoDesdePadre();
        this.delVisible.set(false);
      }, error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
      }
    });
  }

  handEdit() {
    this.selectedRole().status = this.selectedStatus?.value;
    this.formSubmitted.set(true);
    if (this.isFormInvalid()) return;

    const action = this.selectedRole().id 
        ? this.roles.up_role(this.selectedRole()) 
        : this.roles.create_rol(this.selectedRole());

    action.subscribe({
      next: () => {
        this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: this.selectedRole().id ? 'Rol actualizado' : 'Rol registrado' 
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
    this.selectedRole.set({ ...data });
    this.selectedStatus = this.statusOptions().find(c => c.value === data.status);
    this.isVisible.set(true);
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
    this.selectedRole.set({
      id: undefined,
      name: '',
      status: '1',
    });
    this.selectedStatus = this.statusOptions().find(s => s.value === '1');
    this.formSubmitted.set(false);
    this.isVisible.set(true);
  }
}
