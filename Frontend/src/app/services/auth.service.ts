import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CarrelloService } from './carrello.service';
import { tap } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<{ token: string | null, ruolo: string | null }>;
  public currentUser$: Observable<{ token: string | null, ruolo: string | null }>;

  constructor(private http: HttpClient, private carrelloService: CarrelloService) {
    this.currentUserSubject = new BehaviorSubject<{ token: string | null, ruolo: string | null }>({
      token: localStorage.getItem('token'),
      ruolo: localStorage.getItem('ruolo')
    });
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get currentUserValue() {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value.token;
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value.ruolo?.toLowerCase() === 'admin';
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string, user: { ruolo: string } }>('/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('ruolo', res.user.ruolo);
        this.currentUserSubject.next({ token: res.token, ruolo: res.user.ruolo });
        this.spostaCarrelloGuestNelDB();
      })
    );
  }

  spostaCarrelloGuestNelDB() {
    const carrelloGuest = JSON.parse(localStorage.getItem('carrello') || '[]');
    if (carrelloGuest.length > 0) {
      carrelloGuest.forEach((item: any) => {
        const prodotto = {
          id:  item.prodottoId,
          name:  item.nome,
          price:  item.prezzo,
          disponibilita: item.disponibilita,
          image_url: item.image_url
        };
        if (item.quantita > 0 && item.quantita <= prodotto.disponibilita) {
          this.carrelloService.addToCart(prodotto, item.quantita)?.subscribe();
        }
      });
      localStorage.removeItem('carrello');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('ruolo');
    this.currentUserSubject.next({ token: null, ruolo: null });
  }
}