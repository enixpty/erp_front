import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SalesInvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/sales/sales-invoices`;
  private docTypesUrl = `${environment.apiUrl}/api/sales/document-types`;

  getInvoices(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/`, { params });
  }

  getInvoiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/`);
  }

  createInvoice(invoice: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, invoice);
  }

  getDocumentTypes(): Observable<any> {
    return this.http.get<any>(`${this.docTypesUrl}/`);
  }

  printInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/print/`, { responseType: 'blob' });
  }
}
