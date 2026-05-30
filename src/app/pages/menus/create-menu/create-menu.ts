import { Component, computed, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
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
  standalone: true,
  imports: [CommonModule, CardModule, InputTextModule, Select, Toast,
            ButtonModule, FormsModule, MessageModule, TooltipModule],
  templateUrl: './create-menu.html',
  styleUrl: './create-menu.css'
})
export class CreateMenu implements OnInit {
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);
  menus = inject(MenuServices);

  formSubmitted = signal(false);
  parentMenus: any[] = [];
  selectedParent: any | undefined;
  isActive = signal<boolean>(true);

  // Iconos PrimeNG comunes para menús de ERP
  commonIcons: string[] = [
    'pi-home', 'pi-th-large', 'pi-chart-bar', 'pi-chart-line', 'pi-shopping-cart',
    'pi-shopping-bag', 'pi-box', 'pi-warehouse', 'pi-dollar', 'pi-wallet',
    'pi-credit-card', 'pi-file', 'pi-file-edit', 'pi-book', 'pi-calculator',
    'pi-users', 'pi-user', 'pi-id-card', 'pi-building', 'pi-briefcase',
    'pi-cog', 'pi-sliders-h', 'pi-shield', 'pi-lock', 'pi-tags',
    'pi-list', 'pi-table', 'pi-calendar', 'pi-clock', 'pi-truck',
    'pi-percentage', 'pi-receipt', 'pi-sitemap', 'pi-folder', 'pi-bookmark',
    'pi-bell', 'pi-envelope', 'pi-print', 'pi-download', 'pi-cloud',
  ];

  iconSearch = signal<string>('');

  newMenu = signal<Menu>({
    id: null, name: '', path: '', icon: '', order: 1, parent: null, active: true
  });

  readonly filteredIcons = computed(() => {
    const term = this.iconSearch().toLowerCase().trim();
    if (!term) return this.commonIcons;
    return this.commonIcons.filter(i => i.includes(term));
  });

  readonly isNameRequired = computed(() =>
    this.formSubmitted() && this.newMenu().name.trim().length === 0);

  readonly isIconRequired = computed(() =>
    this.formSubmitted() && this.newMenu().icon.trim().length === 0);

  readonly isOrderRequired = computed(() =>
    this.formSubmitted() && (this.newMenu().order === null || this.newMenu().order <= 0));

  readonly isFormInvalid = computed(() =>
    this.isNameRequired() || this.isIconRequired() || this.isOrderRequired());

  ngOnInit() {
    this.menus.get_menulist().subscribe({
      next: (resp) => { this.parentMenus = resp; this.cd.detectChanges(); }
    });
  }

  // Helpers de actualización inmutable del signal
  patch(field: keyof Menu, value: any) {
    this.newMenu.update(m => ({ ...m, [field]: value }));
  }

  selectIcon(icon: string) {
    this.patch('icon', icon);
  }

  reset() {
    this.newMenu.set({ id: null, name: '', path: '', icon: '', order: 1, parent: null, active: true });
    this.selectedParent = undefined;
    this.isActive.set(true);
    this.iconSearch.set('');
    this.formSubmitted.set(false);
  }

  create() {
    this.formSubmitted.set(true);
    if (this.isFormInvalid()) {
      this.messageService.add({ severity: 'warn', summary: 'Datos incompletos',
        detail: 'Complete los campos obligatorios marcados.' });
      return;
    }

    this.patch('active', this.isActive());
    this.patch('parent', this.selectedParent?.id || null);

    this.menus.create_menu(this.newMenu()).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Menú creado',
          detail: `"${this.newMenu().name}" se creó exitosamente.` });
        this.reset();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error',
        detail: 'No se pudo crear el menú.' })
    });
  }
}
