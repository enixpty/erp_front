import { Component, inject, signal, computed  } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button'; 
import {  FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoginUser } from '@src/app/auth/interface/user.interface';
import { AuthService } from '@src/app/auth/services/auth.services'
import { Router } from '@angular/router';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  imports: [InputTextModule, ButtonModule, FormsModule, ToastModule, PasswordModule],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.css'
})



export class Login {
  auth = inject(AuthService) 
  messageService = inject(MessageService)
  router = inject(Router)

  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  loading = signal(false); // Nueva señal de estado
    
  ngOnInit() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.email.set(savedEmail);
      this.rememberMe.set(true);
    }
  }
    
  // Validaciones con computed signals
  emailValid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email());
  });
  
  passwordValid = computed(() => this.password().length >= 6);
  
  formValid = computed(() => this.emailValid() && this.passwordValid() && !this.loading());
  
  // Errores
  emailError = computed(() => {
    if (!this.email()) return '';
    return this.emailValid() ? '' : 'Email inválido';
  });
  
  passwordError = computed(() => {
    if (!this.password()) return '';
    return this.passwordValid() ? '' : 'Mínimo 6 caracteres';
  });

  login(){
    if (this.formValid()) {
      setTimeout(() => this.loading.set(true));
      let data : LoginUser = {
        email: this.email(),
        password: this.password()
      } 
      this.auth.login(data).subscribe({
        next: (resp) => {
          this.loading.set(false);
          if(resp){
            if (this.rememberMe()) {
              localStorage.setItem('rememberedEmail', this.email());
            } else {
              localStorage.removeItem('rememberedEmail');
            }
            this.alert('success', 'Success' ,"Usuario autenticado exitosamente")
            this.router.navigateByUrl('home')
          }else{
            this.alert('error', 'Error' ,"Usuario no autenticado")
          }
        },
        error: () => {
          this.loading.set(false);
          this.alert('error', 'Error' ,"Ocurrió un error inesperado")
        }
      })
    }
  }

  alert(a :string , b : string,  msg : string){
    this.messageService.add({ severity: a, summary: b, detail:  msg });
  }

}
