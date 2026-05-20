import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditNoteService {
  private http = inject(HttpClient);
  private apiUrl = '/api/sales/credit-notes/';

  createCreditNote(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getCreditNotes(params: any): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }

  getCreditNoteById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}${id}/`);
  }
}
