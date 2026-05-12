import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, CategoryResponse } from '../interfaces/category.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory/categories`;

  getCategories(params: any): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/`, { params });
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/`, category);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${category.id}/`, category);
  }

  deleteCategory(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
