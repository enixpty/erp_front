import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@auth/services/auth.services';
import { MenuTemplate } from './components/menu-template/menu-template';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuTemplate],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
    authService = inject(AuthService)
    router = inject(Router)
    isbar = signal<boolean>(false); 
    nomb = signal<string>('');

   ngOnInit(){
    this.nomb.set(this.authService.full_name())
   
   }
}
