import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, ProductResponse } from '../interfaces/product.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory/products`;

  getProducts(params: any): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/`, { params });
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/`, product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.id}/`, product);
  }

  deleteProduct(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
