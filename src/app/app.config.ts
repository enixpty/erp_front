import { ApplicationConfig, 
  provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router'; 
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { loggingInterceptor } from '@auth/interceptors/loggins.interceptor';
import { authInterceptor } from '@auth/interceptors/auth.interceptor';
import { MessageService, ConfirmationService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    ConfirmationService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection( ),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        loggingInterceptor,
        authInterceptor
      ])
    ),
    provideAnimationsAsync(),
            providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    darkModeSelector: false,
                    darkMode: false,
                    cssLayer: false
                }
            },
            translation: {
                startsWith: 'Comienza con',
                contains: 'Contiene',
                notContains: 'No contiene',
                endsWith: 'Termina con',
                equals: 'Es igual a',
                notEquals: 'No es igual a',
                lt: 'Menor que',
                lte: 'Menor o igual a',
                gt: 'Mayor que',
                gte: 'Mayor o igual a',
                matchAll: 'Coincidir con todos',
                matchAny: 'Coincidir con cualquiera',
                apply: 'Aplicar',
                clear: 'Limpiar',
                addRule: 'Agregar regla',
                removeRule: 'Eliminar regla',
                accept: 'Aceptar',
                reject: 'Rechazar',
                choose: 'Elegir',
                upload: 'Subir',
                cancel: 'Cancelar',
                dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
                monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                today: 'Hoy',
                weekHeader: 'Sem',
                weak: 'Débil',
                medium: 'Medio',
                strong: 'Fuerte',
                passwordPrompt: 'Ingrese una contraseña'
            }
        })
  ]
};
