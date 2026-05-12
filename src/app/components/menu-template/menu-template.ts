import { Component, inject, Input, signal, ViewChild, computed } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu'; 
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '@auth/services/auth.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-template',
  imports: [Menubar, AvatarModule, Menu],
  templateUrl: './menu-template.html',
  styleUrl: './menu-template.css',
})
export class MenuTemplate { 
    @Input() pname: string | undefined;
    @ViewChild('profileMenu') profileMenu!: Menu;
    
    router = inject(Router);
    authService = inject(AuthService);
    
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
