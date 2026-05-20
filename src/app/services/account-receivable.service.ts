import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountReceivableService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/sales/accounts-receivable`;

  getAgingReport() {
    return this.http.get<any>(`${this.url}/aging_report/`);
  }

  getPendingByClient(clientId: number) {
    return this.http.get<any[]>(`${this.url}/pending_by_client/?client_id=${clientId}`);
  }

  applyMultiplePayments(data: { payment_data: any, applications: any[] }) {
    return this.http.post(`${this.url}/apply_payment/`, data);
  }
}
