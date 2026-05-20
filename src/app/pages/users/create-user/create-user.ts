import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { NgClass } from '@angular/common';
import { UserServices } from '@src/app/services/users';
import { User } from '@src/app/interfaces/user.interface';
import { RolesServices } from '@src/app/services/roles';

@Component({
  selector: 'app-create-user',
  imports: [CardModule, NgClass, InputTextModule, InputNumberModule, Select, Toast, 
            ButtonModule, FormsModule, MessageModule],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
  providers: [MessageService],
})
export class CreateUser {
  private messageService = inject(MessageService);
  users = inject(UserServices);
  roleServices = inject(RolesServices)
  typesev = signal<string>('');
  txtmessage = signal<string>('');
  txtitle = signal<string>('');
  txtpasswd = signal<string>('');
  txtrpasswd = signal<string>('');
  formSubmitted = signal(false);
  status: any[] | undefined;
  selected: any | undefined;
  roles: any[] | undefined;
  selectedRole: any | undefined;

  newUser = signal<User>({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    role_id: null,
    is_active: true,
    password: null,
    rpassword: null,
    max_line_discount: 0,
    max_global_discount: 0
  });

  readonly isFirstRequired = computed(() => {
    return this.formSubmitted() && this.newUser().first_name.trim().length == 0;
  });

  readonly isLastRequired = computed(() => {
    return this.formSubmitted() && this.newUser().last_name.trim().length == 0;
  });

  readonly isStatusRequired = computed(() => {
    return this.formSubmitted() && this.selected == null;
  });

  readonly isRoleRequired = computed(() => {
    return this.formSubmitted() && this.selectedRole == null;
  });

  readonly isPasswdRequired = computed(() => {
    return this.formSubmitted() && 
           this.txtpasswd().length > 1 && 
           this.txtpasswd().length < 6;
  });

  readonly isRpasswdRequired = computed(() => {
    return this.formSubmitted() && 
           (this.txtrpasswd().length > 1 && 
            this.txtrpasswd().length < 6) || 
           this.txtpasswd() != this.txtrpasswd();
  });

  readonly isEmailValid = computed(() => {
    const email = this.newUser().email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.formSubmitted() && !emailRegex.test(email);
  });

  readonly isFormInvalid = computed(() => {
    return this.isFirstRequired() ||
           this.isLastRequired() ||
           this.isStatusRequired() ||
           this.isRoleRequired() ||
           this.isPasswdRequired() ||
           this.isRpasswdRequired() ||
           this.isEmailValid();
  });

  ngOnInit() {
    this.status = [
      { value: true, description: 'Activo' },
      { value: false, description: 'Inactivo' }
    ];
    this.selected = this.status.find(c => c.value === true);
    this.roleServices.get_roleslist().subscribe(      resp => {
        this.roles = resp;
      }
    )

  }

  triggerToast() {
    this.messageService.add({
      severity: this.typesev(),
      summary: this.txtitle(),
      detail: this.txtmessage()
    });
  }

  reset() {
    this.newUser.set({
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      role_id: null,
      is_active: true,
      password: null,
      rpassword: null,
      max_line_discount: 0,
      max_global_discount: 0
    });
    this.txtpasswd.set('');
    this.txtrpasswd.set('');
    this.selected = this.status?.find(c => c.value === true);
    this.selectedRole = undefined;
    this.formSubmitted.set(false);
  }

  create() {
    this.formSubmitted.set(true);
    if (this.isFormInvalid()) {
      return;
    }

    this.newUser().is_active = this.selected?.value;
    this.newUser().password = this.txtpasswd();
    this.newUser().rpassword = this.txtrpasswd(); 
    this.newUser().role_id = this.selectedRole?.id ;
    debugger
    this.users.create_user(this.newUser()).subscribe({
      next: (resp) => {
        this.txtitle.set('Usuario creado exitosamente');
        this.typesev.set('success');
        this.triggerToast();
        this.reset();
      },
      error: (err: any) => {
        this.txtitle.set('Error al crear el usuario');
        this.typesev.set('error');
        this.txtmessage.set(err);
        this.triggerToast();
      }
    });
  }
}
