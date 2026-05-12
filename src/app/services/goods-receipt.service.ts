import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';
import { GoodsReceipt } from '@src/app/interfaces/goods-receipt.interface';

@Injectable({ providedIn: 'root' })
export class GoodsReceiptService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/purchases/goods-receipts/`;

  createReceipt(data: GoodsReceipt): Observable<GoodsReceipt> {
    return this.http.post<GoodsReceipt>(this.url, data);
  }

  getReceiptById(id: any): Observable<any> {
    return this.http.get<any>(`${this.url}${id}/`);
  }

  printReceiptPDF(id: any): Observable<Blob> {
    return this.http.get(`${this.url}${id}/pdf/`, { responseType: 'blob' });
  }
}
