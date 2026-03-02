import { Routes } from '@angular/router';
import {ProductDetail} from './products/product-detail/product-detail';
import {Boutique} from './features/boutique/boutique';
import {Home} from './home/home/home';
import {ProductConfig} from './products/product-config/product-config';


export const routes: Routes = [
  { path: '', component: Home},
  { path: 'boutique', component: Boutique},
  { path: 'boutique/:category', component: Boutique }, // Pour filtrer par catégorie
  { path: 'produit/:id', component: ProductDetail },
  { path: 'produit/:id/configurer', component: ProductConfig },

  { path: '**', redirectTo: '' }
];
