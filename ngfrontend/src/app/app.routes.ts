import { Routes } from '@angular/router';
import {ProductDetail} from './products/product-detail/product-detail';
import {Boutique} from './features/boutique/boutique';
import {Home} from './home/home/home';
import {ProductConfig} from './products/product-config/product-config';
import {ProductCreateComponent} from './features/product-create/product-create';
import {CartComponent} from './features/cart/cart';


export const routes: Routes = [
  { path: '', component: Home},
  { path: 'boutique', component: Boutique},
  { path: 'boutique/:category', component: Boutique }, // Pour filtrer par catégorie
  { path: 'produit/create', component: ProductCreateComponent },
  { path: 'produit/:id', component: ProductDetail },
  { path: 'produit/:id/configurer', component: ProductConfig },
  {path: 'panier', component:CartComponent},



  { path: '**', redirectTo: '' }
];
