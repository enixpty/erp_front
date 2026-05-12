import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';
import { VendorInvoice } from '@src/app/interfaces/vendor-invoice.interface';

@Injectable({ providedIn: 'root' })
export class VendorInvoiceService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/purchases/vendor-invoices/`;

  createInvoice(data: VendorInvoice): Observable<VendorInvoice> {
    return this.http.post<VendorInvoice>(this.url, data);
  }

  getInvoices(params: any): Observable<any> {
    return this.http.get<any>(this.url, { params });
  }

  downloadInvoicePDF(id: number): Observable<Blob> {
    return this.http.get(`${this.url}${id}/pdf/`, { responseType: 'blob' });
  }
}
