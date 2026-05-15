import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Quotation, QuotationResponse } from '../interfaces/quotation.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/sales/quotations`;

  getQuotations(params: any): Observable<QuotationResponse> {
    return this.http.get<QuotationResponse>(`${this.apiUrl}/`, { params });
  }

  getQuotationById(id: number): Observable<Quotation> {
    return this.http.get<Quotation>(`${this.apiUrl}/${id}/`);
  }

  createQuotation(quotation: Quotation): Observable<Quotation> {
    return this.http.post<Quotation>(`${this.apiUrl}/`, quotation);
  }

  updateQuotation(quotation: Quotation): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.apiUrl}/${quotation.id}/`, quotation);
  }

  deleteQuotation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
