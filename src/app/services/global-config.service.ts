import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GlobalConfigService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/core/global-config/`;

  getConfig(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }
}
