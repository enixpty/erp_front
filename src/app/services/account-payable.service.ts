import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';
import { AccountPayable } from '@src/app/interfaces/account-payable.interface';

@Injectable({ providedIn: 'root' })
export class AccountPayableService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/purchases/accounts-payable/`;

  getAccountsPayable(params: any): Observable<any> {
    return this.http.get<any>(this.url, { params });
  }

  getAgingReport(): Observable<any> {
    return this.http.get<any>(`${this.url}aging_report/`);
  }
}
