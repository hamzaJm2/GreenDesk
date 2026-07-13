import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-dashboard-component/admin-dashboard-component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'produits',
    loadComponent: () =>
      import('./admin-produits/admin-produits').then(m => m.AdminProduitsComponent)
  },
  {
    path: 'produits/creer',
    loadComponent: () =>
      import('../features/product-create/product-create').then(m => m.ProductCreateComponent)
  },
  {
    path: 'produits/:id',
    loadComponent: () =>
      import('./admin-produit-params/admin-produit-params').then(m => m.AdminProduitParamsComponent)
  },
  {
    path: 'icones',
    loadComponent: () =>
      import('./admin-icones/admin-icones').then(m => m.AdminIcones)
  },
  {
    path: 'maquettes',
    loadComponent: () =>
      import('./admin-maquettes/admin-maquettes').then(m => m.AdminMaquettesComponent)
  },
  {
    path: 'comptes-attente',
    loadComponent: () =>
      import('./admin-comptes-attente/admin-comptes-attente').then(m => m.AdminComptesAttenteComponent)
  }
];

