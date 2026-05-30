import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class StockMovementService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/inventory/stock-movements/`;

  getStockMovements(params: any): Observable<any> {
    return this.http.get<any>(this.url, { params });
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.url}export_excel/`, { responseType: 'blob' });
  }

  createStockMovement(data: any): Observable<any> {
    return this.http.post<any>(this.url, data);
  }
}
