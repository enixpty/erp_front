import { Component, computed, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { NgClass } from '@angular/common';
import { MenuServices } from '@src/app/services/menu';

interface Menu {
  id: number | null;
  name: string;
  path: string;
  icon: string;
  order: number;
  parent?: number | null;
  active: boolean;
}

@Component({
  selector: 'app-create-menu',
  imports: [CardModule, NgClass, InputTextModule, Select, Toast, 
            ButtonModule, FormsModule, MessageModule],
  templateUrl: './create-menu.html',
  styleUrl: './create-menu.css',
  providers: [MessageService],
})
export class CreateMenu implements OnInit {
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);
  typesev = signal<string>('');
  txtmessage = signal<string>('');
  txtitle = signal<string>('');
  formSubmitted = signal(false);
  status: any[] | undefined;
  selected: any | undefined;
  parentMenus: any[] = [];
  selectedParent: any | undefined;

  menus = inject(MenuServices);

  newMenu = signal<Menu>({
    id: null,
    name: '',
    path: '',
    icon: '',
    order: 1,
    parent: null,
    active: true
  });

  readonly isNameRequired = computed(() => {
    return this.formSubmitted() && this.newMenu().name.trim().length == 0;
  });

  readonly isIconRequired = computed(() => {
    return this.formSubmitted() && this.newMenu().icon.trim().length == 0;
  });

  readonly isOrderRequired = computed(() => {
    return this.formSubmitted() && (this.newMenu().order === null || this.newMenu().order <= 0);
  });

  readonly isStatusRequired = computed(() => {
    return this.formSubmitted() && this.selected == null;
  });

  readonly isFormInvalid = computed(() => {
    return this.isNameRequired() || this.isIconRequired() || this.isOrderRequired() || this.isStatusRequired();
  });

  ngOnInit() {
    this.status = [
      { value: true, description: 'Activo' },
      { value: false, description: 'Inactivo' }
    ];
    this.selected = this.status.find(c => c.value === true);
    
    this.menus.get_menulist().subscribe({
      next: (resp) => {
          this.parentMenus = resp;
          this.cd.detectChanges();
      }
    });
  }

  triggerToast() {
    this.messageService.add({
      severity: this.typesev(),
      summary: this.txtitle(),
      detail: this.txtmessage()
    });
  }

  reset() {
    this.newMenu.set({
      id: null,
      name: '',
      path: '',
      icon: '',
      order: 0,
      parent: null,
      active: true
    });
    this.selected = this.status?.find(c => c.value === true);
    this.selectedParent = undefined;
    this.formSubmitted.set(false);
  }

  create() {
    this.formSubmitted.set(true);
    if (this.isFormInvalid()) {
      return;
    }

    this.newMenu().active = this.selected?.value;
    this.newMenu().parent = this.selectedParent?.id || null;

    this.menus.create_menu(this.newMenu()).subscribe((resp) => {  

      this.txtitle.set('Menú creado exitosamente');
      this.typesev.set('success');
      this.triggerToast();
      this.reset();
    })
  }
}
