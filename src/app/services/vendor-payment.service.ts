import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorPaymentService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/purchases/vendor-payments/`;

  createPayment(data: any): Observable<any> {
    return this.http.post<any>(this.url, data);
  }
}
