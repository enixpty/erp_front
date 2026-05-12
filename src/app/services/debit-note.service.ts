import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class DebitNoteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/purchases/debit-notes/`;

  getDebitNotes(params: any): Observable<any> {
    return this.http.get<any>(this.url, { params });
  }

  createDebitNote(data: any): Observable<any> {
    return this.http.post<any>(this.url, data);
  }
}
