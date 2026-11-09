//SERVE PER INTERCETTARE LE RICHIESTE HTTP E GESTIRE GLI ERRORI DI AUTENTICAZIONE. IN PARTICOLARE, SE LA RISPOSTA DEL SERVER HA CODICE 401 (UNAUTHORIZED), IL SERVIZIO DI AUTENTICAZIONE EFFETTUA IL LOGOUT DELL'UTENTE.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';//inject è una funzione che permette di ottenere un'istanza di un servizio senza doverlo passare come parametro al costruttore. In questo caso, viene utilizzata per ottenere un'istanza del servizio AuthService e del Router.
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);///dammi il servizio AuthService per poter effettuare il logout dell'utente in caso di errore 401.
  const router = inject(Router);//dammi il router per poter navigare tra le pagine dell'applicazione in caso di errore 401.

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        authService.logout();
      }
      return throwError(() => err);
    })
  );//.pipe serve per sapere se la richiesta HTTP ha avuto successo o meno. In caso di errore, viene gestito l'errore 401 (Unauthorized) effettuando il logout dell'utente.
};