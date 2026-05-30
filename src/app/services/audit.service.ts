import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/audit`;

  getLogs(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params[key] === null || params[key] === undefined) continue;
      if (key === 'filters') {
        httpParams = httpParams.set(key, JSON.stringify(params[key]));
      } else {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this.http.get<any>(`${this.url}/logs/`, { params: httpParams });
  }
}
