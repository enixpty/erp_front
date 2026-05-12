import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Attribute, AttributeResponse, AttributeValue, AttributeValueResponse } from '../interfaces/attribute.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory`;

  // Atributos
  getAttributes(params: any): Observable<AttributeResponse> {
    return this.http.get<AttributeResponse>(`${this.apiUrl}/attributes/`, { params });
  }

  createAttribute(attr: Attribute): Observable<Attribute> {
    return this.http.post<Attribute>(`${this.apiUrl}/attributes/`, attr);
  }

  updateAttribute(attr: Attribute): Observable<Attribute> {
    return this.http.put<Attribute>(`${this.apiUrl}/attributes/${attr.id}/`, attr);
  }

  deleteAttribute(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/attributes/${id}/`);
  }

  // Valores de Atributos
  getAttributeValues(params: any): Observable<AttributeValueResponse> {
    return this.http.get<AttributeValueResponse>(`${this.apiUrl}/attribute-values/`, { params });
  }

  createAttributeValue(val: AttributeValue): Observable<AttributeValue> {
    return this.http.post<AttributeValue>(`${this.apiUrl}/attribute-values/`, val);
  }

  updateAttributeValue(val: AttributeValue): Observable<AttributeValue> {
    return this.http.put<AttributeValue>(`${this.apiUrl}/attribute-values/${val.id}/`, val);
  }

  deleteAttributeValue(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/attribute-values/${id}/`);
  }
}
