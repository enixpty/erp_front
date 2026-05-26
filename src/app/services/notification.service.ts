import { Injectable, inject, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { environment } from '@src/environments/environment';
import { AuthService } from '@auth/services/auth.services';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private zone = inject(NgZone);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private eventSource!: EventSource;

  connect(): void {
    const userId = this.authService.user_id();
    
    // Si ya hay una conexión activa para este usuario, no hacemos nada
    if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
        console.log('SSE: Ya existe una conexión activa');
        return;
    }

    if (!userId) {
      console.warn('SSE: No se puede conectar, user_id es null');
      return;
    }

    const url = `${environment.apiUrl}/api/core/notifications/stream/?user_id=${userId}`;
    console.log('SSE: URL de conexión:', url);
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('SSE: Conexión abierta exitosamente');
    };

    this.eventSource.onmessage = (event) => {
      console.log('SSE: Mensaje recibido:', event.data);
      this.zone.run(() => {
        const data = JSON.parse(event.data);
        
        // Manejo de notificaciones generales
        if (data.type === 'notification') {
          this.messageService.add({
            severity: data.severity || 'info',
            summary: data.title || 'Notificación',
            detail: data.message,
            life: 5000
          });
        }
        
        // Manejo de notificación de OC generadas
        if (data.type === 'PURCHASE_ORDERS_GENERATED') {
          this.messageService.add({
            severity: 'success',
            summary: 'Órdenes Generadas',
            detail: data.message,
            life: 8000
          });
          console.log('SSE: OCs generadas:', data.po_ids);
        }
      });
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      this.eventSource.close();
      // Reintentar conexión tras 10 segundos
      setTimeout(() => this.connect(), 10000);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
