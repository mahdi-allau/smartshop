import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit, OnDestroy {
  utenti: any[] = [];
  loading = true;
  errore = '';
  ordiniPerUtente: { [userId: number]: any[] } = {};
  utenteMostraOrdini: number | null = null;
  ordineDettaglio: any = null;
  nuovoStatoOrdine: string = '';
  dettagliSpedizione: string = '';
  sezione: string = 'utenti';
  prodotti: any[] = [];
  prodottoEdit: any = null;
  categorie: any[] = [];
  brand: any[] = [];
  selectedFile: File | null = null;
  showScontoSelect = false;
  showScontoEditSelect = false;
  private authSubscription?: Subscription;
  private storageCheckInterval?: any;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Monitora lo stato di autenticazione tramite AuthService
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (!user.token || user.ruolo?.toLowerCase() !== 'admin') {
        this.router.navigate(['/login']);
      }
    });

    // Controllo periodico del localStorage 
    this.storageCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      const ruolo = localStorage.getItem('ruolo');
      if (!token || ruolo?.toLowerCase() !== 'admin') {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }, 500);

    this.caricaUtenti();
    this.caricaProdotti();
    this.caricaCategorie();
    this.caricaBrand();
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    if (this.storageCheckInterval) {
      clearInterval(this.storageCheckInterval);
    }
  }

  caricaCategorie() {
    this.http.get<any[]>('/admin/category', { headers: this.getAuthHeaders() }).subscribe({
      next: categorie => this.categorie = categorie,
      error: () => this.categorie = []
    });
  }

  caricaBrand() {
    this.http.get<any[]>('/admin/brand', { headers: this.getAuthHeaders() }).subscribe({
      next: brand => this.brand = brand,
      error: () => this.brand = []
    });
  }

  caricaProdotti() {
    this.http.get<any[]>('/admin/products', { headers: this.getAuthHeaders() }).subscribe({
      next: prodotti => this.prodotti = prodotti,
      error: () => this.prodotti = []
    });
  }

  addProduct(product: any) {
    product.promo = !!product.promo;
    product.bloccato = !!product.bloccato;
    product.in_vetrina = !!product.in_vetrina;

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.http.post('/admin/product', {
          ...product,
          imageBase64: base64,
          imageFileName: this.selectedFile!.name,
          image_url: this.selectedFile!.name
        }, { headers: this.getAuthHeaders() }).subscribe({
          next: () => {
            this.caricaProdotti();
            this.selectedFile = null;
          }
        });
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.http.post('/admin/product', product, { headers: this.getAuthHeaders() }).subscribe({
        next: () => this.caricaProdotti()
      });
    }
  }

  editProduct(prodotto: any) {
    this.prodottoEdit = { ...prodotto };
    this.showScontoEditSelect = !!this.prodottoEdit.promo;
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  updateProduct(id: number, product: any) {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        product.imageBase64 = base64;
        product.imageFileName = this.selectedFile!.name;
        product.image_url = this.selectedFile!.name;
        this.http.put(`/admin/product/${id}`, product, { headers: this.getAuthHeaders() }).subscribe({
          next: () => {
            this.caricaProdotti();
            this.prodottoEdit = null;
            this.selectedFile = null;
          }
        });
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      product.image_url = this.prodottoEdit.image_url;
      this.http.put(`/admin/product/${id}`, product, { headers: this.getAuthHeaders() }).subscribe({
        next: () => {
          this.caricaProdotti();
          this.prodottoEdit = null;
        }
      });
    }
  }

  rimuoviProdotto(id: number) {
    if (confirm('Sei sicuro di voler bloccare questo prodotto?')) {
      this.http.delete(`/admin/product/${id}`, { headers: this.getAuthHeaders() }).subscribe({
        next: () => this.caricaProdotti()
      });
    }
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  caricaUtenti() {
    this.loading = true;
    this.http.get<any[]>('/admin/users', { headers: this.getAuthHeaders() }).subscribe({
      next: utenti => {
        this.utenti = utenti;
        this.loading = false;
        utenti.forEach(u => this.caricaOrdiniUtente(u.id, false));
      },
      error: err => {
        this.errore = 'Errore nel caricamento utenti';
        this.loading = false;
      }
    });
  }

  bloccaUtente(userId: number) {
    if (confirm('Sei sicuro di voler bloccare questo utente?')) {
      this.http.put(`/admin/block/${userId}`, {}, { headers: this.getAuthHeaders() }).subscribe({
        next: () => this.caricaUtenti()
      });
    }
  }

  sbloccaUtente(userId: number) {
    if (confirm('Sei sicuro di voler sbloccare questo utente?')) {
      this.http.put(`/admin/unblock/${userId}`, {}, { headers: this.getAuthHeaders() }).subscribe({
        next: () => this.caricaUtenti()
      });
    }
  }

  gestisciAdmin(userId: number, makeAdmin: boolean) {
    this.http.put(`/admin/set-admin/${userId}`, { admin: makeAdmin }, { headers: this.getAuthHeaders() }).subscribe({
      next: () => this.caricaUtenti()
    });
  }

  toggleOrdini(userId: number) {
    if (this.utenteMostraOrdini === userId) {
      this.utenteMostraOrdini = null;
    } else {
      this.utenteMostraOrdini = userId;
      this.caricaOrdiniUtente(userId, true);
    }
  }

  caricaOrdiniUtente(userId: number, force: boolean) {
    if (this.ordiniPerUtente[userId] && !force) return;
    this.http.get<any[]>(`/admin/orders/${userId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: ordini => this.ordiniPerUtente[userId] = ordini,
      error: () => this.ordiniPerUtente[userId] = []
    });
  }

  apriDettaglioOrdine(ordine: any) {
    this.ordineDettaglio = { ...ordine };
    this.nuovoStatoOrdine = ordine.stato;
    this.dettagliSpedizione = ordine.dettagli_spedizione || '';
  }

  aggiornaStatoOrdine() {
    if (!this.ordineDettaglio) return;
    this.http.put(`/admin/orders/${this.ordineDettaglio.id}/stato`, 
      { stato: this.nuovoStatoOrdine, dettagli_spedizione: this.dettagliSpedizione }, 
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.ordineDettaglio.stato = this.nuovoStatoOrdine;
        this.ordineDettaglio.dettagli_spedizione = this.dettagliSpedizione;
        const ordini = this.ordiniPerUtente[this.ordineDettaglio.user_id];
        if (ordini) {
          const idx = ordini.findIndex(o => o.id === this.ordineDettaglio.id);
          if (idx > -1) {
            ordini[idx].stato = this.nuovoStatoOrdine;
            ordini[idx].dettagli_spedizione = this.dettagliSpedizione;
          }
        }
        this.ordineDettaglio = null;
      }
    });
  }

  rimuoviUtente(userId: number) {
    if (confirm('Sei sicuro di voler eliminare definitivamente questo utente?')) {
      this.http.delete(`/admin/users/${userId}`, { headers: this.getAuthHeaders() }).subscribe({
        next: () => this.caricaUtenti()
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  onPromoChange(form: any) {
    this.showScontoSelect = form.value.promo;
    if (!this.showScontoSelect) form.value.sconto = 0;
  }

  onPromoEditChange() {
    this.showScontoEditSelect = !!this.prodottoEdit?.promo;
    if (!this.showScontoEditSelect) this.prodottoEdit.sconto = 0;
  }
}