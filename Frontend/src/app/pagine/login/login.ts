import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => alert('Credenziali non valide')
    });
  }
}