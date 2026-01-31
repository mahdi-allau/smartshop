import { Routes } from '@angular/router';
import { Home } from './pagine/home/home';
import { Catalogo } from './pagine/catalogo/catalogo';
import { DettaglioProdottoComponent } from './pagine/dettaglio-prodotto/dettaglio-prodotto';
import { LoginComponent } from './pagine/login/login';
import { RegisterComponent } from './pagine/register/register';
import { CarrelloComponent } from './pagine/carrello/carrello';
import { CheckoutComponent } from './pagine/checkout/checkout';
import { ProfiloComponent } from './pagine/profilo/profilo';
import { OrdineDettaglioComponent } from './pagine/dettaglio-ordine/dettaglio-ordine';
import { Admin } from './pagine/admin/admin';
import { AdminGuard } from './services/admin.guard';

// in queto file definiamo le rotte dell'applicazione per poter navigare tra le pagine
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'catalogo', component: Catalogo },
  { path: 'catalogo/:id', component: DettaglioProdottoComponent},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'carrello', component: CarrelloComponent},
  { path: 'checkout', component: CheckoutComponent},
  { path: 'profilo', component: ProfiloComponent},
  { path: 'ordine/:id', component: OrdineDettaglioComponent},
  { path: 'admin', component: Admin, canActivate: [AdminGuard] }
   
];
