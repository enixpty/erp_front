import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error inesperado';
        
        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 401:
              errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
              this.router.navigate(['/auth/login']);
              break;
            case 403:
              errorMessage = 'No tiene permisos para realizar esta acción.';
              break;
            case 500:
              errorMessage = 'Error interno del servidor. Contacte al administrador.';
              break;
            default:
              errorMessage = error.error?.message || `Código de error: ${error.status}`;
          }
        }
        
        // Aquí podrías disparar un componente de notificación tipo Toast
        console.error('Global Error Interceptor:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
