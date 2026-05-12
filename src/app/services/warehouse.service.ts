import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Warehouse } from '../interfaces/warehouse.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory`;

  getWarehouses(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/warehouses/`, { params });
  }

  createWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    return this.http.post<Warehouse>(`${this.apiUrl}/warehouses/`, warehouse);
  }

  updateWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.apiUrl}/warehouses/${warehouse.id}/`, warehouse);
  }

  deleteWarehouse(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/warehouses/${id}/`);
  }
}
