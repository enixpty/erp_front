import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, ClientResponse } from '../interfaces/client.interface';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/sales/clients`;

  getClients(params: any): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/`, { params });
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}/`);
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/`, client);
  }

  updateClient(client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${client.id}/`, client);
  }

  deleteClient(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
