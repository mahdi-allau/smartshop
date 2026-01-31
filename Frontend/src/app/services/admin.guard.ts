import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
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