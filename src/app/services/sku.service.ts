import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SKU, ProductEAN } from '../interfaces/sku.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SkuService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory`;

  getSkus(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/skus/`, { params });
  }

  getSkusByProduct(productId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/skus/?product=${productId}`);
  }

  createSku(sku: SKU): Observable<SKU> {
    return this.http.post<SKU>(`${this.apiUrl}/skus/`, sku);
  }

  updateSku(sku: SKU): Observable<SKU> {
    return this.http.put<SKU>(`${this.apiUrl}/skus/${sku.id}/`, sku);
  }

  deleteSku(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/skus/${id}/`);
  }

  // EANs
  createEan(ean: ProductEAN): Observable<ProductEAN> {
    return this.http.post<ProductEAN>(`${this.apiUrl}/eans/`, ean);
  }

  deleteEan(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eans/${id}/`);
  }
}
