import { Routes } from '@angular/router';
import { ProductDetail } from './products/product-detail/product-detail';
import { Boutique } from './features/boutique/boutique';
import { Home } from './home/home/home';
import { ProductConfig } from './products/product-config/product-config';
import { CartComponent } from './features/cart/cart';
import { MaquettesComponent } from './features/maquettes-component/maquettes-component';
import { NouvellesMaquettesComponent } from './features/nouvelles-maquettes-component/nouvelles-maquettes-component';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // ── Public ────────────────────────────────────────────────────────────────
  { path: '', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'boutique', component: Boutique },
  { path: 'boutique/:category', component: Boutique },
  { path: 'produit/:id', component: ProductDetail },
  { path: 'produit/:id/configurer', component: ProductConfig },
  { path: 'panier', component: CartComponent },

  // ── Authentifié ───────────────────────────────────────────────────────────
  { path: 'maquettes', component: MaquettesComponent, canActivate: [authGuard] },
  { path: 'maquettes/nouvelle', component: NouvellesMaquettesComponent, canActivate: [authGuard] },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: '' }
];
