import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentTypeService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/sales/document-types/`;

  getDocumentTypes(params?: any): Observable<any> {
    return this.http.get<any>(this.url, { params });
  }
}
