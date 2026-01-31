import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OrdineService } from '../../services/ordine.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarrelloService } from '../../services/carrello.service';
// AGGIUNGI il service per gli indirizzi
import { IndirizziService } from '../../services/indirizzi.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CheckoutComponent {
  destinatario = '';
  indirizzo = '';
  citta = '';
  cap = '';
  paese = '';
  telefono = '';
  metodoPagamento = 'carta';
  numeroCarta = '';
  scadenza = '';
  cvv = '';

  carrello: any[] = [];
  totale: number = 0;

  // Variabili per gestione indirizzi
  indirizzi: any[] = [];
  indirizzoSelezionato: any = null;
  mostraFormAggiunta = false;

  constructor(
    private ordineService: OrdineService,
    private carrelloService: CarrelloService,
    private indirizziService: IndirizziService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.carrelloService.isLoggedIn()) {
      this.carrelloService.getCarrelloUtente().subscribe(res => {
        this.carrello = res.map(item => {
        let prezzoFinale = Number(item.price);
        if (item.promo && item.sconto && item.sconto > 0) {
          prezzoFinale = +(Number(item.price) * (1 - item.sconto / 100)).toFixed(2);
        }
        return {
          prodotto_id: item.prodotto_id,
          nome: item.name,
          quantita: item.quantita,
          prezzo: Number(item.price),
          prezzoFinale: prezzoFinale,
          image_url: item.image_url,
          promo: item.promo,
          sconto: item.sconto
        };
      });
      this.totale = this.carrello.reduce(
        (sum, i) => sum + (i.prezzoFinale !== undefined ? i.prezzoFinale : i.prezzo) * i.quantita,
        0
      );
      });

      // Carica indirizzi salvati
      this.caricaIndirizzi();
    } else {
      this.carrello = this.carrelloService.getCarrelloGuest().map((item: any) => {
  let prezzoFinale = item.prezzo;
  if (item.promo && item.sconto && item.sconto > 0) {
    prezzoFinale = +(item.prezzo * (1 - item.sconto / 100)).toFixed(2);
  }
  return {
    prodotto_id: item.prodotto_id,
    nome: item.nome,
    quantita: item.quantita,
    prezzo: item.prezzo,
    prezzoFinale: prezzoFinale,
    image_url: item.image_url,
    promo: item.promo,
    sconto: item.sconto
  };
});
this.totale = this.carrello.reduce(
  (sum, i) => sum + (i.prezzoFinale !== undefined ? i.prezzoFinale : i.prezzo) * i.quantita,
  0
);
    }
  }

  caricaIndirizzi() {
    this.indirizziService.getIndirizziUtente().subscribe(data => {
      this.indirizzi = data;
      if (this.indirizzi.length > 0) {
        this.indirizzoSelezionato = this.indirizzi[0];
        this.aggiornaCampiIndirizzo();
        this.mostraFormAggiunta = false;
      } else
      {
        this.mostraFormAggiunta = true;
      }
    });
  }

  aggiornaCampiIndirizzo() {
  if (this.indirizzoSelezionato) {
    this.destinatario = this.indirizzoSelezionato.nome_destinatario;
    this.indirizzo = this.indirizzoSelezionato.indirizzo;
    this.citta = this.indirizzoSelezionato.citta;
    this.cap = this.indirizzoSelezionato.cap;
    this.paese = this.indirizzoSelezionato.paese;
  }
}

  salvaNuovoIndirizzo() {
    const nuovo = {
      nome_destinatario: this.destinatario,
      indirizzo: this.indirizzo,
      citta: this.citta,
      cap: this.cap,
      paese: this.paese,
      telefono: this.telefono
    };
    this.indirizziService.aggiungiIndirizzo(nuovo).subscribe(res => {
      this.mostraFormAggiunta = false;
      this.caricaIndirizzi();
      // Pulisci i campi del form
      this.destinatario = '';
      this.indirizzo = '';
      this.citta = '';
      this.cap = '';
      this.paese = '';
      this.telefono = '';
    });
  }

  onCheckout() {
    if (!this.isScadenzaValida()) {
      alert('La data di scadenza della carta non è valida o la carta è scaduta.');
      return;
    }

  const prodotti = this.carrello.map(item => ({
  prodotto_id: item.prodotto_id,
  quantita: item.quantita,
  prezzo_unitario: item.prezzoFinale !== undefined ? item.prezzoFinale : item.prezzo
}));


   
    
      const datiSpedizione = {
        indirizzo_id: this.indirizzoSelezionato.id,
        nome_destinatario: this.indirizzoSelezionato.nome_destinatario,
        indirizzo: this.indirizzoSelezionato.indirizzo,
        citta: this.indirizzoSelezionato.citta,
        cap: this.indirizzoSelezionato.cap,
        paese: this.indirizzoSelezionato.paese,
        telefono: this.indirizzoSelezionato.telefono
      };
    
    

    const datiPagamento = {
      metodo: this.metodoPagamento,
      numeroCarta: this.numeroCarta,
      scadenza: this.scadenza,
      cvv: this.cvv
    };

    this.ordineService.creaOrdine(datiSpedizione, datiPagamento, prodotti).subscribe({
      next: () => {
        alert('Ordine e pagamento effettuati!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        alert(err.error?.error || 'Errore durante il checkout');
      }
    });
  }

  formattaNumeroCarta() {
    let value = this.numeroCarta.replace(/\D/g, '');
    value = value.slice(0, 16);
    this.numeroCarta = value.replace(/(.{4})/g, '$1 ').trim();
  }

  formattaScadenza() {
    let value = this.scadenza.replace(/\D/g, '');
    value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    this.scadenza = value;
  }

  isScadenzaValida(): boolean {
    const match = this.scadenza.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const mese = parseInt(match[1], 10);
    const anno = parseInt(match[2], 10);
    if (mese < 1 || mese > 12) return false;
    const now = new Date();
    const annoCorrente = now.getFullYear() % 100;
    const meseCorrente = now.getMonth() + 1;
    if (anno > annoCorrente) return true;
    if (anno === annoCorrente && mese >= meseCorrente) return true;
    return false;
  }

  pulisciCVV() {
    this.cvv = this.cvv.replace(/[^0-9]/g, '').slice(0, 4);
  }

  soloNumeri(event: KeyboardEvent) {
    if (
      !/[0-9]/.test(event.key) &&
      !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)
    ) {
      event.preventDefault();
    }
  }
}