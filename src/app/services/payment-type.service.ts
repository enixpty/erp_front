import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';

export interface PaymentType {
    id?: number;
    name: string;
    ledger_account?: number | null;
    ledger_account_name?: string;
    is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class PaymentTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sales/payment-types/`;

  getPaymentTypes(params?: any) { return this.http.get<any>(this.apiUrl, { params }); }
  createPaymentType(data: PaymentType) { return this.http.post<PaymentType>(this.apiUrl, data); }
  updatePaymentType(data: PaymentType) { return this.http.put<PaymentType>(`${this.apiUrl}${data.id}/`, data); }
  deletePaymentType(id: number) { return this.http.delete(`${this.apiUrl}${id}/`); }
}
