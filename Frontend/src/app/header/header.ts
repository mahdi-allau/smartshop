import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class Header implements OnInit, OnDestroy {
  showSignInMenu: boolean = false;
  isLoggedIn: boolean = false;
  isAdminUser: boolean = false;
  private authSubscription?: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Sottoscrivi ai cambiamenti dello stato utente
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user.token;
      this.isAdminUser = user.ruolo?.toLowerCase() === 'admin';
    });

    document.addEventListener('click', () => {
      this.showSignInMenu = false;
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  toggleSignInMenu(event: Event) {
    event.stopPropagation();
    this.showSignInMenu = !this.showSignInMenu;
  }

  isAdmin(): boolean {
    return this.isAdminUser;
  }

  vaiAreaAdmin() {
    this.router.navigate(['/admin']);
  }
}