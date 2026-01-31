import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OrdineService {
  constructor(private http: HttpClient) {}

  // Crea un nuovo ordine (acquisto)
 creaOrdine(datiSpedizione: any, datiPagamento: any, prodotti: any[]) {
  return this.http.post('/orders', {
    spedizione: datiSpedizione,
    pagamento: datiPagamento,
    prodotti: prodotti
  }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
}

  // Ottieni tutti gli ordini dell'utente loggato
  getMieiOrdini() {
    return this.http.get('/orders', {
      headers: this.getAuthHeaders()
    });
  }

  // Helper per aggiungere il token JWT alle richieste protette
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : {};
  }
}