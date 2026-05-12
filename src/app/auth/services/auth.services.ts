import { HttpClient } from "@angular/common/http";
import { inject, Injectable, computed, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { AuthResponse } from "@auth/interface/auth-response.interface";
import { LoginUser, User } from "@src/app/auth/interface/user.interface";
import { catchError, map, Observable, of, tap } from "rxjs";
import { environment } from "@src/environments/environment";
import { Router } from '@angular/router';
type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated'
const baseUrl = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private _authStatus = signal<AuthStatus>('checking')
    private _user = signal<User|null>(null)
    private _token = signal<string|null>(localStorage.getItem('token'))  
    private http = inject(HttpClient);
    readonly token = this._token.asReadonly();
    public showNavbar = computed(() => this._authStatus());
    public profile_name = computed( ()=> this._user())
    public full_name = signal<string>('')
    public user_menus = signal<any[]>([])

    constructor(private router: Router){
    // Verificar al iniciar
     this.checkStatus()
    }
    checkStatusResource = rxResource({
      stream : ()=> this.checkStatus()
    })

 
    authStatus = computed<AuthStatus>(() => {
        if (this._authStatus() === 'checking') return 'checking'

        if(this._user()){
          return 'authenticated'
        }

        return 'not-authenticated'
    });

     login(data: LoginUser):Observable<boolean>{   
        return this.http.post<any>(`${ baseUrl }/api/security/users/login/`, {
          email: data.email,
          password: data.password
        }).pipe(
            map(resp =>{ 
              this.handleAuthSuccess(resp) 
            }),
            map(() => true),
            catchError((error:any) =>  this.handleAuthError(error))
        )
     }

     checkStatus(): Observable<boolean>{ 
      const token = localStorage.getItem('token')
      if (!token){ 
        this.logout()
        return of(false)
      }
      return this.http.post<any>(`${baseUrl}/api/security/token/verify/`, 
        { 
          token :  token,
      }).pipe(
            map(resp =>{
              if(resp.valid == true){
                this._authStatus.set('authenticated') 
              }else{ 
                this.handleAuthSuccess(resp) 
              } 

              let nom = resp.first_name + ' ' + resp.last_name 
              this.full_name.set(nom)
              
              // Guardar los menús del usuario
              if (resp.menus) {
                this.user_menus.set(resp.menus);
              }
               
            }),
            map(() => true),
            catchError((error:any) => this.handleAuthError(error))
        ) 
     }


     logout(){
      
      this._authStatus.set('not-authenticated')
      this._token.set(null)
      this._user.set(null)
      localStorage.removeItem('token')
     }

     private handleAuthSuccess(resp : AuthResponse){
      this._authStatus.set('authenticated')
     
       this._user.set({
         first_name :  resp.first_name,
         username: "",
         email: resp.email,
         last_name: resp.last_name
       });
      this._token.set(resp.tokens  );  
      localStorage.setItem('token', resp.tokens);
      //localStorage.setItem('refresh', resp.refresh)
     }
     private handleAuthError(error:any){
      this.logout()
      return of(false)
     }
}