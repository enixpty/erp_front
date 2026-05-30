import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SalesOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/sales/sales-orders`;

  getSalesOrders(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/`, { params });
  }

  getSalesOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/`);
  }

  cancelOrder(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel/`, { reason });
  }

  createInvoice(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/create_invoice/`, {});
  }

  generateInvoice(id: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/invoice/`, data);
  }

  printOrder(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/print/`, { responseType: 'blob' });
  }
}
