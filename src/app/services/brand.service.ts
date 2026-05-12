import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Brand, BrandResponse } from '../interfaces/brand.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory/brands`;

  getBrands(params: any): Observable<BrandResponse> {
    return this.http.get<BrandResponse>(`${this.apiUrl}/`, { params });
  }

  createBrand(brand: Brand): Observable<Brand> {
    return this.http.post<Brand>(`${this.apiUrl}/`, brand);
  }

  updateBrand(brand: Brand): Observable<Brand> {
    return this.http.put<Brand>(`${this.apiUrl}/${brand.id}/`, brand);
  }

  deleteBrand(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
