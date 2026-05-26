import { Component, inject, Input, ViewChild, computed } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu'; 
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '@auth/services/auth.services';
import { Router } from '@angular/router';
import { BreakpointService } from '@src/app/services/breakpoint.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-template',
  standalone: true,
  imports: [Menubar, AvatarModule, Menu, CommonModule],
  templateUrl: './menu-template.html',
  styleUrl: './menu-template.css',
})
export class MenuTemplate { 
    @Input() pname: string | undefined;
    @ViewChild('profileMenu') profileMenu!: Menu;
    
    router = inject(Router);
    authService = inject(AuthService);
    isMobile$ = inject(BreakpointService).isMobile$;
    menuPT = {
    root: { class: 'bg-blue-900 border-none' },
    itemContent: ({ context }: any) => ({
        class: context.level === 0 
        ? (context.active ? 'bg-white text-gray-900' : 'text-white hover:bg-blue-800') 
        : 'text-gray-700 hover:bg-gray-100'
    }),
    itemLabel: ({ context }: any) => ({
        class: context.level === 0 
        ? (context.active ? 'text-gray-900' : 'text-white') 
        : 'text-gray-700'
    }),
    itemIcon: ({ context }: any) => ({
        class: context.level === 0 
        ? (context.active ? 'text-gray-900' : 'text-white') 
        : 'text-gray-500'
    }),
    // Asegura que la flecha hacia abajo también cambie de color
    submenuIcon: ({ context }: any) => ({
        class: context.level === 0 
        ? (context.active ? 'text-gray-900' : 'text-white') 
        : 'text-gray-500'
    }),
    submenu: { class: 'bg-white shadow-lg border border-gray-200' }
    };
        // Computed signals for reactive UI
        initial = computed(() => {
            const name = this.authService.full_name();
            return name && name.length > 0 ? name[0].toUpperCase() : 'U';
        });

    items = computed(() => {
        const userMenus = this.authService.user_menus();
        if (!userMenus || userMenus.length === 0) return [];
        return this.buildMenuItems(userMenus);
    });

    hasMenus = computed(() => this.items().length > 0);

    profileItems: MenuItem[] = [];

    ngOnInit() {
        
        this.loadProfileMenu();
    }

    buildMenuItems(menus: any[]): MenuItem[] {
        return menus.map(menu => ({
            label: menu.name,
            icon: menu.icon,
            routerLink: menu.path || undefined,
            items: menu.children ? this.buildMenuItems(menu.children) : undefined
        }));
    }

    loadProfileMenu() {
        this.profileItems = [
            {
                label: this.pname,
                items: [
                    { separator: true },
                    {
                        label: 'Cerrar Sesión',
                        icon: 'pi pi-sign-out',
                        command: () => this.logout()
                    }
                ]
            }
        ];
    }

    toggleMenu(event: Event) {
        this.profileMenu.toggle(event);
    }
    
    logout(){
        this.authService.logout();
        this.router.navigateByUrl("auth");
    }
}
