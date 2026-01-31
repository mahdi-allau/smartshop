import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CarrelloService } from '../../services/carrello.service';

interface Prodotto {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  image_url: string;
  promo?: boolean;   
  sconto?: number;  
  
}

@Component({
  selector: 'app-dettaglio-prodotto',
  templateUrl: './dettaglio-prodotto.html',
  styleUrls: ['./dettaglio-prodotto.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class DettaglioProdottoComponent implements OnInit {
  prodotto?: Prodotto;

  constructor(private route: ActivatedRoute, private http: HttpClient, private carrelloService: CarrelloService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Prodotto>(`/products/${id}`).subscribe(data => {
        this.prodotto = data;
      });
    }
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