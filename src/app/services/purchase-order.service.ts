import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';
import { PurchaseOrder } from '@src/app/interfaces/purchase-order.interface';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/purchases/orders/`;

  getPurchaseOrders(params?: any): Observable<any> {
    return this.http.get<any>(this.url, { params });
  }

  getPurchaseOrderById(id: any): Observable<any> {
    return this.http.get<any>(`${this.url}${id}/`);
  }

  createPurchaseOrder(data: PurchaseOrder): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.url, data);
  }

  confirmOrder(id: any): Observable<any> {
    return this.http.post(`${this.url}${id}/confirm/`, {});
  }

  cancelOrder(id: any): Observable<any> {
    return this.http.post(`${this.url}${id}/cancel/`, {});
  }

  printOrderPDF(id: any): Observable<Blob> {
    return this.http.get(`${this.url}${id}/pdf/`, { responseType: 'blob' });
  }
}
