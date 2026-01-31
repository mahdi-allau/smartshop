import { Component, OnInit } from '@angular/core';
import { OrdineService } from '../../services/ordine.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.html',
  styleUrls: ['./profilo.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ProfiloComponent implements OnInit {
  indirizzi: any[] = [];
  nuovoIndirizzo = { nome_destinatario: '', indirizzo: '', citta: '', cap: '', paese: '', telefono: '' };
  ordini: any[] = [];
  indirizzoDaModificare: number | null = null;

utente = {
  nome: '',
  cognome: '',
  email: '',
  data_nascita: '',
  sesso: '',
  telefono: '',
  nuovaPassword: '',
  confermaPassword: ''
};




  mostraFormIndirizzo = false;
  mostraListaOrdini = false;
  mostraImpostazioniAccount = true;

  constructor(private http: HttpClient, private ordineService: OrdineService) {}

  ngOnInit() {
    this.http.get('/auth/utente', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).subscribe((res: any) => { 
    this.utente = res;
  });
    this.caricaIndirizzi();
    this.caricaOrdini();
  this.mostraImpostazioniAccount = true;
  this.mostraFormIndirizzo = false;
  this.mostraListaOrdini = false;
  }

  caricaIndirizzi() {
  this.http.get<any[]>('/indirizzi', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).subscribe(res => this.indirizzi = res);
}

eliminaIndirizzo(id: number) {
  this.http.delete(`/indirizzi/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).subscribe(() => this.caricaIndirizzi());
}

modificaIndirizzo(indirizzo: any) {
  // Puoi aprire un form di modifica, oppure popolare il form esistente con i dati dell'indirizzo
  this.nuovoIndirizzo = { ...indirizzo };
  this.indirizzoDaModificare = indirizzo.id; // aggiungi questa variabile al tuo componente
}


salvaIndirizzo() {
  if (this.indirizzoDaModificare) {
    this.http.put('/indirizzi', { ...this.nuovoIndirizzo, id: this.indirizzoDaModificare }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe(() => {
      this.nuovoIndirizzo = { nome_destinatario: '', indirizzo: '', citta: '', cap: '', paese: '', telefono: '' };
      this.indirizzoDaModificare = null;
      this.caricaIndirizzi();
    });
  } else {
    this.http.post('/indirizzi', this.nuovoIndirizzo, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: () => {
        this.nuovoIndirizzo = { nome_destinatario: '', indirizzo: '', citta: '', cap: '', paese: '', telefono: '' };
        this.caricaIndirizzi();
      },
      error: (err) => {
        if (err.status === 409 && err.error && err.error.id) {
          alert('Indirizzo già esistente! Modifica i dati se necessario.');
          this.indirizzoDaModificare = err.error.id;
          this.nuovoIndirizzo = err.error.indirizzo;
        } else {
          alert(err.error?.error || 'Errore durante il salvataggio');
        }
      }
    });
  }
}

salvaImpostazioniAccount() {
  if (this.utente.nuovaPassword && this.utente.nuovaPassword !== this.utente.confermaPassword) {
    alert('Le password non coincidono');
    return;
  }
  // Prepara i dati da inviare (non inviare confermaPassword)
 const datiAggiornati: any = {
  nome: this.utente.nome,
  cognome: this.utente.cognome,
  email: this.utente.email,
  data_nascita: this.utente.data_nascita,
  sesso: this.utente.sesso,
  telefono: this.utente.telefono
};
  if (this.utente.nuovaPassword) {
    datiAggiornati.password = this.utente.nuovaPassword;
  }

  this.http.put('/auth/utente', datiAggiornati, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).subscribe({
    next: (res: any) => {
      alert('Dati aggiornati con successo');
      // Aggiorna i dati locali se necessario
      this.utente.nuovaPassword = '';
      this.utente.confermaPassword = '';
    },
    error: (err) => {
      alert(err.error?.error || 'Errore durante il salvataggio');
    }
  });
}


  impostaPredefinito(id: number) {
  this.http.post('/indirizzi/predefinito', { id }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).subscribe(() => this.caricaIndirizzi());
}

  caricaOrdini() {
  this.ordineService.getMieiOrdini().subscribe((res: any) => this.ordini = res.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime()));
}

pulisciForm() {
  this.nuovoIndirizzo = { nome_destinatario: '', indirizzo: '', citta: '', cap: '', paese: '', telefono: '' };
  this.indirizzoDaModificare = null;
}

toggleFormIndirizzo() {
  this.mostraImpostazioniAccount = false;
  this.mostraFormIndirizzo = true;
  this.mostraListaOrdini = false;
}
toggleListaOrdini() {
  this.mostraImpostazioniAccount = false;
  this.mostraFormIndirizzo = false;
  this.mostraListaOrdini = true;
}
toggleImpostazioniAccount() {
  this.mostraImpostazioniAccount = true;
  this.mostraFormIndirizzo = false;
  this.mostraListaOrdini = false;
}

}