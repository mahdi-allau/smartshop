import { Component, OnInit } from '@angular/core';
import { OrdineService } from '../../services/ordine.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarrelloService } from '../../services/carrello.service';

interface CarrelloItem {
  prodottoId: number;
  nome: string;
  prezzo: number;
  quantita: number;
  disponibilita: number;
  image_url: string;
  prezzoFinale?: number;
  promo?: boolean;    
  sconto?: number; 
}

@Component({
  selector: 'app-carrello',
  templateUrl: './carrello.html',
  styleUrls: ['./carrello.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})

export class CarrelloComponent implements OnInit {
  carrello: CarrelloItem[] = [];
  totale: number = 0;
  isLoggedIn: boolean = false;

  constructor(
    private ordineService: OrdineService,
    private http: HttpClient,
    private router: Router,
    private carrelloService: CarrelloService
  ) {}
  
  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.loadCarrello();
    console.log(this.carrello)
    
  }

  loadCarrello() {
    if (this.isLoggedIn) {
      // Carrello da backend
      this.http.get<any[]>('/cart', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
}).subscribe({
  next: (res) => {
    // Mappa i campi ai nomi usati nel frontend e trasforma price in numero
    this.carrello = res.map(item => {
  let prezzoFinale = Number(item.price);
  if (item.promo && item.sconto && item.sconto > 0) {
    prezzoFinale = +(Number(item.price) * (1 - item.sconto / 100)).toFixed(2);
  }
  return {
    prodottoId: item.prodotto_id,
    nome: item.name,
    prezzo: Number(item.price),
    quantita: item.quantita,
    disponibilita: item.disponibilita,
    image_url: item.image_url,
     promo: item.promo,      
    sconto: item.sconto,  
    prezzoFinale: prezzoFinale
  };
});
    this.calcolaTotale();
  },
  error: () => {
    this.carrello = [];
    this.totale = 0;
  }
});
    } else {
      // Carrello da localStorage
  this.carrello = (JSON.parse(localStorage.getItem('carrello') || '[]') as CarrelloItem[]).map(item => {
  let prezzoFinale = item.prezzo;
  if (item.promo && item.sconto && item.sconto > 0) {
    prezzoFinale = +(item.prezzo * (1 - item.sconto / 100)).toFixed(2);
  }
  return { ...item, prezzoFinale };
});
      this.calcolaTotale();
    }
  }

  calcolaTotale() {
    this.totale = this.carrello.reduce(
  (sum, item) => sum + (item.prezzoFinale !== undefined ? item.prezzoFinale : item.prezzo) * item.quantita,
  0
);
  }

  aggiornaQuantita(prodottoId: number, nuovaQuantita: number) {
    if (this.carrelloService.isLoggedIn()) {
      this.carrelloService.aggiornaQuantitaUtente(prodottoId, nuovaQuantita).subscribe({
        next: (res) => {
          const item = this.carrello.find(i => i.prodottoId === prodottoId);
          if (item) item.quantita = nuovaQuantita;
          this.calcolaTotale();
        },
        error: (err) => {
          alert('Errore durante l\'aggiornamento della quantità');}
      });
    } else {
        this.carrelloService.aggiornaQuantitaGuest(prodottoId, nuovaQuantita);
        const item = this.carrello.find(i => i.prodottoId === prodottoId);
        if (item) item.quantita = nuovaQuantita;
        this.calcolaTotale();
    }
  }


  rimuovi(item: CarrelloItem) {
  if (this.isLoggedIn) {
    // Chiama il backend per rimuovere il prodotto
    this.carrelloService.rimuoviDalCarrello(item.prodottoId).subscribe({
      next: () => {
        this.carrello = this.carrello.filter(i => i.prodottoId !== item.prodottoId);
        this.calcolaTotale();
      },
      error: () => {
        alert('Errore durante la rimozione dal carrello');
      }
    });
  } else {
    this.carrello = this.carrello.filter(i => i.prodottoId !== item.prodottoId);
    this.calcolaTotale();
    this.salvaCarrello();
  }
}

  
  salvaCarrello() {
      localStorage.setItem('carrello', JSON.stringify(this.carrello));
  }


  vaiAlCheckout() {
    if (!this.isLoggedIn) {
      alert('Devi essere loggato per procedere al checkout!');
      this.router.navigate(['/login']);
      return;
    } else {
  this.router.navigate(['/checkout']);
}
}

}