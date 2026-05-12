import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { NgClass } from '@angular/common';

import { RolesServices } from '@src/app/services/roles';

interface Role {
  id: number | null;
  name: string;
  is_active: boolean;
}

@Component({
  selector: 'app-create-role',
  imports: [CardModule, NgClass, InputTextModule, Select, Toast, 
            ButtonModule, FormsModule, MessageModule],
  templateUrl: './create-role.html',
  styleUrl: './create-role.css',
  providers: [MessageService],
})
export class CreateRole {
  private messageService = inject(MessageService);
  roles = inject(RolesServices); // Inject your RoleServices here
  typesev = signal<string>('');
  txtmessage = signal<string>('');
  txtitle = signal<string>('');
  formSubmitted = signal(false);
  status: any[] | undefined;
  selected: any | undefined;

  newRole = signal<Role>({
    id: null,
    name: '',
    is_active: true
  });

  readonly isNameRequired = computed(() => {
    return this.formSubmitted() && this.newRole().name.trim().length == 0;
  });

  readonly isStatusRequired = computed(() => {
    return this.formSubmitted() && this.selected == null;
  });

  readonly isFormInvalid = computed(() => {
    return this.isNameRequired() || this.isStatusRequired();
  });

  ngOnInit() {
    this.status = [
      { value: true, description: 'Activo' },
      { value: false, description: 'Inactivo' }
    ];
    this.selected = this.status.find(c => c.value === true);
  }

  triggerToast() {
    this.messageService.add({
      severity: this.typesev(),
      summary: this.txtitle(),
      detail: this.txtmessage()
    });
  }

  reset() {
    this.newRole.set({
      id: null,
      name: '',
      is_active: true
    });
    this.selected = this.status?.find(c => c.value === true);
    this.formSubmitted.set(false);
  }

  create() {
    this.formSubmitted.set(true);
    if (this.isFormInvalid()) {
      return;
    }

    this.newRole().is_active = this.selected?.value;
 
    this.roles.create_rol(this.newRole()).subscribe({
      next: (resp) => {
        this.txtitle.set('Rol creado exitosamente');
        this.typesev.set('success');
        this.triggerToast();
        this.reset();
      },
      error: (err: any) => {
        this.txtitle.set('Error al crear el rol');
        this.typesev.set('error');
        this.txtmessage.set(err);
        this.triggerToast();
      }
    });

  }
}
