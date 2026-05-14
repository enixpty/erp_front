import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@auth/services/auth.services';
import { MenuTemplate } from './components/menu-template/menu-template';
import { NotificationService } from './services/notification.service';
import { ToastModule } from 'primeng/toast';
import { effect } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuTemplate, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
    authService = inject(AuthService)
    notificationService = inject(NotificationService)
    router = inject(Router)
    isbar = signal<boolean>(false); 
    nomb = signal<string>('');

   constructor() {
    // Escuchar cambios en el user_id para conectar SSE
    effect(() => {
      const userId = this.authService.user_id();
      if (userId) {
        this.notificationService.connect();
      }
    });
   }

   ngOnInit(){
    this.nomb.set(this.authService.full_name())
   }
}
