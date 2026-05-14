import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';
import { VendorReturn } from '@src/app/interfaces/vendor-return.interface';

@Injectable({ providedIn: 'root' })
export class VendorReturnService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/purchases/vendor-returns/`;

  createReturn(data: VendorReturn): Observable<VendorReturn> {
    return this.http.post<VendorReturn>(this.url, data);
  }

  getReturns(params: any): Observable<any> {
    return this.http.get<any>(this.url, { params });
  }

  getReturnById(id: any): Observable<any> {
    return this.http.get<any>(`${this.url}${id}/`);
  }
}
