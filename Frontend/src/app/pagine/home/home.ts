import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router'; 
import { CarrelloService } from '../../services/carrello.service';

interface Prodotto {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  image_url: string;
   promo?: boolean;
  sconto?: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule] 
})
export class Home {
  vetrina: Prodotto[] = [];

  constructor(private http: HttpClient, private carrelloService: CarrelloService) {
    this.caricaVetrina();
  }

  caricaVetrina() {
    this.http.get<Prodotto[]>('/products/vetrina').subscribe(data => {
      this.vetrina = data;
    });
  }

  aggiungiAlCarrello(prodotto: any) {
    const res = this.carrelloService.addToCart(prodotto, 1);
    if (res && res.subscribe) {
      res.subscribe({
        next: () => alert('Prodotto aggiunto al carrello!'),
        error: () => alert('Errore durante l\'aggiunta al carrello')
      });
    } else {
      alert('Prodotto aggiunto al carrello!');
    }
  }
  
}