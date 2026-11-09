import { inject } from '@angular/core';//inject è una funzione che permette di ottenere un'istanza di un servizio senza doverlo passare come parametro al costruttore. In questo caso, viene utilizzata per ottenere un'istanza del servizio AuthService e del Router.
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const AdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);//dammi un'istanza del servizio AuthService per poter accedere alle informazioni sull'utente corrente.
  const router = inject(Router);//dammi un'istanza del router per poter navigare tra le pagine dell'applicazione.
  const token = localStorage.getItem('token');
  const ruolo = localStorage.getItem('ruolo');

  // Controlla prima se c'è un token valido
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  if (ruolo?.toLowerCase() === 'admin') {
    return true;
  } 
  else if (ruolo?.toLowerCase() === 'user') {
    alert('Accesso riservato solo agli amministratori!');
    router.navigate(['/']);
    return false;
  }
  else {
    router.navigate(['/login']);
    return false;
  }
};