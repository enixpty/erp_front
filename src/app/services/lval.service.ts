import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Lval, LvalResponse } from '../interfaces/lval.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LvalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/settings/lval`;

  listLvals(category: string): Observable<Lval[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<Lval[]>(`${this.apiUrl}/list_lval_by_category/`, { params });
  }

  getLvals(params: any): Observable<LvalResponse> {
    return this.http.get<LvalResponse>(`${this.apiUrl}/`, { params });
  }

  createLval(lval: Lval): Observable<Lval> {
    return this.http.post<Lval>(`${this.apiUrl}/`, lval);
  }

  updateLval(lval: Lval): Observable<Lval> {
    return this.http.put<Lval>(`${this.apiUrl}/${lval.id}/`, lval);
  }

  deleteLval(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
