import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';
import { Cia, CiaResponse } from '../interfaces/cia.interface';

@Injectable({
  providedIn: 'root'
})
export class CiaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/security/cias`;

  getMyCompany(): Observable<CiaResponse> {
    return this.http.get<CiaResponse>(`${this.apiUrl}/get_my_company/`);
  }

  saveCompanyInfo(cia: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/save_company_info/`, cia);
  }
}
