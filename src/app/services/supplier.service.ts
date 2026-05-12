import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Supplier, SupplierResponse } from '../interfaces/supplier.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory/suppliers`;

  getSuppliers(params: any): Observable<SupplierResponse> {
    return this.http.get<SupplierResponse>(`${this.apiUrl}/`, { params });
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.apiUrl}/`, supplier);
  }

  updateSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${supplier.id}/`, supplier);
  }

  deleteSupplier(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
