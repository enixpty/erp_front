import { Component, computed, inject, signal, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button'; 
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageModule } from 'primeng/message';

import { UserServices } from '@src/app/services/users';
import { Customtable } from '@src/app/components/customTable/customtable'; 
import { CustomModal } from '@src/app/components/custom-modal/custom-modal';
import { User } from '@src/app/interfaces/user.interface';
import { RolesServices } from '@src/app/services/roles';
import { LvalService } from '@src/app/services/lval.service';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CardModule, InputTextModule, InputMaskModule,Select, Toast, 
            ButtonModule, FormsModule,FloatLabelModule, MessageModule, Customtable, CustomModal], 
  templateUrl: './list-user.html',
  styleUrl: './list-user.css',
  providers: [MessageService], 
})
export class ListUser implements OnInit {

  @ViewChild('usersTable') customTableComponent!: Customtable; 
  private messageService = inject(MessageService);
  private lvalService = inject(LvalService);
  isVisible = signal<boolean>(false);
  delVisible = signal<boolean>(false);
  
  txtpasswd  = signal<string>('');
  txtrpasswd = signal<string>('');
  
  statusOptions = signal<any[]>([]);
  selectedStatus = signal<any | undefined>(undefined);
  
  roles: any[] | undefined;
  selectedRole: any | undefined;
  
  users = inject(UserServices); 
  roleServices = inject(RolesServices);
  formSubmitted = signal(false);

  readonly isFirstRequired = computed(() => this.formSubmitted() && this.selectedUser().first_name.trim().length == 0);
  readonly isLastRequired = computed(() => this.formSubmitted() && this.selectedUser().last_name.trim().length == 0);  
  readonly isStatusRequired = computed(() => this.formSubmitted() && this.selectedStatus() == null);
  readonly isRoleRequired = computed(() => this.formSubmitted() && (!this.selectedRole || this.selectedRole.id == 0));
  
  readonly isPasswdRequired = computed(() => this.formSubmitted() && this.txtpasswd().length > 0 && this.txtpasswd().length < 6);
  readonly isRpasswdRequired = computed(() => this.formSubmitted() && (this.txtrpasswd().length > 0 && (this.txtrpasswd().length < 6 || this.txtpasswd() != this.txtrpasswd())));

  readonly isEmailValid = computed(() => {
        const email = this.selectedUser().email; 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        return this.formSubmitted() && !emailRegex.test(email);
    });

  cols = [
      { field: 'id', header: 'Id', order: true, filter: true  },
      { field: 'first_name', header: 'Nombre', order: true, filter: true  },
      { field: 'last_name', header: 'Apellido', order: true, filter: true  },
      { field: 'email', header: 'Email', order: true, filter: true  },
      { field: 'is_active', header: 'Estado', order: true, filter: true  }, 
      { field: 'created', header: 'Fecha Creacion', order: true, filter: true  },
      { field: 'modified', header: 'Modificado', order: true, filter: true },
      { field: 'action', header: '' , order: false, filter: false }  
  ];

  readonly isFormInvalid = computed(() => 
        this.isFirstRequired() || this.isLastRequired() || this.isStatusRequired() ||
        this.isRoleRequired() || this.isPasswdRequired() || this.isRpasswdRequired() || this.isEmailValid()
  );

  ngOnInit() {
    this.loadStatusOptions();
    this.roleServices.get_roleslist().subscribe(resp => {
        this.roles = resp;
    });
  }

  loadStatusOptions() {
    this.lvalService.listLvals('STD').subscribe({
      next: (data) => {
        this.statusOptions.set(data);
        if (!this.selectedUser().id) {
          this.selectedStatus.set(data.find(s => s.value === 'ACTIVE'));
        }
      }
    });
  }

  selectedUser = signal<User>({ 
    id: null,
    first_name: '',
    last_name: '',
    email: '',  
    role_id: null,
    is_active: true, 
    password: null,
    rpassword: null   
  });
  
  selectedDelete = signal<User>({ 
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    role_id: null,
    is_active: true, 
    password: null,
    rpassword: null   
  });

  delExit() {
    this.isVisible.set(false);
    this.delVisible.set(false);
  }

  handDelete() {
    this.users.del_user(this.selectedDelete().id).subscribe({
       next: () =>{ 
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado' });
          this.forzarRefrescoDesdePadre();
          this.delVisible.set(false);
        },
        error: (err: any) => { 
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err });
        }
    });
  }

  handEdit() { 
    this.selectedUser().is_active = this.selectedStatus()?.value === 'ACTIVE'; 
    this.selectedUser().role_id = this.selectedRole?.id;
    this.selectedUser().password = this.txtpasswd();
    this.selectedUser().rpassword = this.txtrpasswd();
    this.formSubmitted.set(true);
    
    if (this.isFormInvalid()) return;

    this.users.up_user(this.selectedUser()).subscribe({
      next: () =>{
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' });
        this.isVisible.set(false);
        this.forzarRefrescoDesdePadre();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err });
      }
    });
  }

  handleEdit(data: any) { 
    this.selectedUser.set({ ...data });
    this.selectedStatus.set(this.statusOptions().find(c => c.value === (data.is_active ? 'ACTIVE' : 'INACTIVE'))); 
    
    if (data.role?.role?.id){
      this.selectedRole = this.roles?.find(c => c.id === data.role.role.id);
    } else {
      this.selectedRole = { id: 0, description: 'Seleccione Rol' };
    }
    this.isVisible.set(true);
  }

  handleDelete(data:User) {
    this.selectedDelete.set(data);
    this.delVisible.set(true);
  }

  forzarRefrescoDesdePadre() {
    if (this.customTableComponent) {
      this.customTableComponent.onRefresh();
    }
  }

  updateUserField(field: keyof User, value: any) {
    let newValue = value;
    if (field == 'is_active') {
      newValue = value.value === 'ACTIVE';
      this.selectedStatus.set(value);
    }
    if (field == 'role_id') {
      newValue = value.id;
      this.selectedRole = value;
    }
    if (field == 'password') {
        this.txtpasswd.set(value);
    }
    if (field == 'rpassword') {
        this.txtrpasswd.set(value);
    }
    this.selectedUser.update(user => ({ ...user, [field]: newValue }));
  }
}
