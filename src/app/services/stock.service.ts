import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class StockService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/inventory/stocks/`;

  getStockLevels(params: any): Observable<any> {
    return this.http.get<any>(this.url, { params });
  }

  getValuation(): Observable<any> {
    return this.http.get<any>(`${this.url}valuation/`);
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.url}export_excel/`, { responseType: 'blob' });
  }
}
