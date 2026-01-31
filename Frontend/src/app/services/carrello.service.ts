import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CarrelloService {
  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  addToCart(item: any, quantita: number = 1) {
    if (this.isLoggedIn()) {
      // Utente loggato: aggiorna backend
      return this.http.post('/cart/add', {
        prodottoId: item.id,
        quantita
      }, {
        headers: this.getAuthHeaders()
      });
    } else {
      // Guest: aggiorna localStorage
      let carrello = JSON.parse(localStorage.getItem('carrello') || '[]');
      const idx = carrello.findIndex((i: any) =>  (i.prodottoId ?? i.id) === (item.id ?? item.prodottoId));
      if (idx > -1) {
        // Se già presente, aggiorna quantità (senza superare la disponibilità)
        carrello[idx].quantita = Math.min(carrello[idx].quantita + quantita, item.disponibilita);
      } else {
        carrello.push({
          prodottoId: item.id,
          nome: item.name,
          prezzo: item.price,
          quantita: Math.min(quantita, item.disponibilita),
          disponibilita: item.disponibilita,
          image_url: item.image_url
        });
      }
      localStorage.setItem('carrello', JSON.stringify(carrello));
      return null;
    }
  }

  rimuoviDalCarrello(prodottoId: number) {
  return this.http.delete(`/cart/remove/${prodottoId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
}

   getCarrelloGuest() {
    return JSON.parse(localStorage.getItem('carrello') || '[]');
  }

  aggiornaQuantitaGuest(prodottoId: number, nuovaQuantita: number) {
    let carrello = this.getCarrelloGuest();
    const idx = carrello.findIndex((i: any) => i.prodottoId === prodottoId);
    if (idx > -1) {
      carrello[idx].quantita = nuovaQuantita;
      localStorage.setItem('carrello', JSON.stringify(carrello));
    }
  }

  aggiornaQuantitaUtente(prodottoId: number, nuovaQuantita: number) {
  return this.http.put(
    '/cart/update',
    { prodottoId, quantita: nuovaQuantita },
    { headers: this.getAuthHeaders() }
  );
}

  
  getCarrelloUtente() {
  return this.http.get<any[]>('/cart', {
    headers: this.getAuthHeaders()
  });
}

  rimuoviGuest(prodottoId: number) {
    let carrello = this.getCarrelloGuest();
    carrello = carrello.filter((i: any) => i.prodottoId !== prodottoId);
    localStorage.setItem('carrello', JSON.stringify(carrello));
  }

  svuotaCarrelloGuest() {
    localStorage.removeItem('carrello');
  }


  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : {};
  }
}