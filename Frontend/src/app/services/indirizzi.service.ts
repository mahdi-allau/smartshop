import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IndirizziService {

  constructor(private http: HttpClient) {}

  getIndirizziUtente(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any[]>('/indirizzi', { headers });
  }

  aggiungiIndirizzo(indirizzo: any){
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<any>('/indirizzi', indirizzo, { headers });
  }
}