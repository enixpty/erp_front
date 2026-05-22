import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/audit`;

  getLogs(params?: any): Observable<any> {
    return this.http.get<any>(`${this.url}/logs/`, { params });
  }
}
