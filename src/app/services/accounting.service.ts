import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountingService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/accounting`;

  // Accounts
  getAccounts(params?: any): Observable<any> {
    return this.http.get<any>(`${this.url}/accounts/`, { params });
  }

  createAccount(data: any): Observable<any> {
    return this.http.post(`${this.url}/accounts/`, data);
  }

  loadDefaultAccounts(): Observable<any> {
    return this.http.post(`${this.url}/accounts/load_defaults/`, {});
  }

  // Fiscal Periods
  getFiscalPeriods(params?: any): Observable<any> {
    return this.http.get<any>(`${this.url}/fiscal-periods/`, { params });
  }

  createFiscalPeriod(data: any): Observable<any> {
    return this.http.post(`${this.url}/fiscal-periods/create_period/`, data);
  }

  closeFiscalPeriod(id: any): Observable<any> {
    return this.http.post(`${this.url}/fiscal-periods/${id}/close_period/`, {});
  }

  // Journal Entries
  getJournalEntries(params?: any): Observable<any> {
    return this.http.get<any>(`${this.url}/journal-entries/`, { params });
  }

  getJournalEntryById(id: any): Observable<any> {
    return this.http.get<any>(`${this.url}/journal-entries/${id}/`);
  }

  createJournalEntry(data: any): Observable<any> {
    return this.http.post(`${this.url}/journal-entries/`, data);
  }

  postJournalEntry(id: any): Observable<any> {
    return this.http.post(`${this.url}/journal-entries/${id}/post_entry/`, {});
  }

  getIncomeStatement(params: any): Observable<any> {
    return this.http.get(`${this.url}/reports/income_statement/`, { params });
  }

  getBalanceSheet(params: any): Observable<any> {
    return this.http.get(`${this.url}/reports/balance_sheet/`, { params });
  }
}
