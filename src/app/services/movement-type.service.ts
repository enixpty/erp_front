import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';
import { MovementType, MovementTypeResponse } from '@src/app/interfaces/movement-type.interface';

@Injectable({ providedIn: 'root' })
export class MovementTypeService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/inventory/movement-types/`;

  getMovementTypes(params?: any): Observable<MovementTypeResponse> {
    return this.http.get<MovementTypeResponse>(this.url, { params });
  }

  createMovementType(data: MovementType): Observable<MovementType> {
    return this.http.post<MovementType>(this.url, data);
  }

  updateMovementType(data: MovementType): Observable<MovementType> {
    return this.http.put<MovementType>(`${this.url}${data.id}/`, data);
  }

  deleteMovementType(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}/`);
  }
}
