import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarrelloService } from '../../services/carrello.service';

interface Prodotto {
  id: number;
  name: string;
  brand: string;
  category: string;
  brand_id: string;
  category_id: string;
  price: number;
  image_url: string;
   promo?: boolean;   
  sconto?: number;
}

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule]
})
export class Catalogo {
  prodotti: Prodotto[] = [];
  prodottiOriginali: Prodotto[] = [];
  categorie: { id: number, name: string }[] = [];
  brand: { id: number, name: string }[] = [];
  ricerca: string = '';
  categoriaSelezionata: string = '0';
  brandSelezionato: string = '0';

  constructor(private carrelloService: CarrelloService, private http: HttpClient) {
    this.caricaProdotti();
    this.caricaCategorie();
    this.caricaBrand();
  }

  caricaProdotti() {
    this.http.get<Prodotto[]>('/products').subscribe(data => {
      this.prodottiOriginali = data;
      this.prodotti = data;
    });
  }

  caricaCategorie() {
  this.http.get<{ id: number, name: string }[]>('/products/categories').subscribe(data => {
    this.categorie = [{ id: 0, name: 'Tutte le categorie' }, ...data];
  });
}

  caricaBrand() {
  this.http.get<{ id: number, name: string }[]>('/products/brands').subscribe(data => {
    this.brand = [{ id: 0, name: 'Tutti i brand' }, ...data];
  });
}

  filtraCategoria(categoriaId: string) {
    this.categoriaSelezionata = categoriaId;
    this.filtraProdotti();
  }

  filtraBrand(brandId: string) {
    this.brandSelezionato = brandId;
    this.filtraProdotti();
  }

filtraProdotti() {
  this.prodotti = this.prodottiOriginali.filter(p =>
    (!this.categoriaSelezionata || this.categoriaSelezionata == '0' || p.category_id == this.categoriaSelezionata) &&
    (!this.brandSelezionato || this.brandSelezionato == '0' || p.brand_id == this.brandSelezionato)
  );
}

  cercaProdotti() {
    this.prodotti = this.prodottiOriginali.filter(p =>
      p.name.toLowerCase().includes(this.ricerca.toLowerCase())
    );
  }

  caricaDettaglio(id: number) {
    this.http.get<Prodotto>(`/products/${id}`).subscribe(data => {
      // mostra i dettagli
    });
  }
  aggiungiAlCarrello(prodotto: any) {
  let prezzoFinale = prodotto.price;
  if (prodotto.promo && (prodotto.sconto || 0) > 0) {
    prezzoFinale = +(prodotto.price * (1 - (prodotto.sconto || 0) / 100)).toFixed(2);
  }
  const prodottoCarrello = { ...prodotto, prezzoFinale };
  const res = this.carrelloService.addToCart(prodottoCarrello, 1);
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