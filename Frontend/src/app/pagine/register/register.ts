import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule]
})
export class RegisterComponent {
  nome = '';
  cognome = '';
  email = '';
  confermaEmail = '';
  password = '';
  confermaPassword = '';
  telefono = '';
  data_nascita = '';
  sesso = '';
  today = '';

  constructor(private http: HttpClient, private router: Router) {
    // Imposta la data massima selezionabile a oggi
    this.today = new Date().toISOString().split('T')[0];
  }

  // rivedere e spiegare meglio ********************
  isMaggiorenne(data: string): boolean {
    const oggi = new Date();
    const nascita = new Date(data);
    const anni = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) {
      return anni - 1 >= 18;
    }
    return anni >= 18;
  }
  

  onRegister() {
    if (this.email !== this.confermaEmail) {
      alert('Le email non coincidono');
      return;
    }
    if (this.password !== this.confermaPassword) {
      alert('Le password non coincidono');
      return;
    }
    if (!this.isMaggiorenne(this.data_nascita)) {
      alert('Devi essere maggiorenne per registrarti');
      return;
    }

    this.http.post('/auth/register', {
      nome: this.nome,
      cognome: this.cognome,
      email: this.email,
      password: this.password,
      telefono: this.telefono,
      data_nascita: this.data_nascita,
      sesso: this.sesso
    }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => alert('Registrazione fallita')
    });
  }
}