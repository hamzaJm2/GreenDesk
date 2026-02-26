import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductGallery } from '../../shared/product-gallery/product-gallery';
import { ProductConfig } from '../product-config/product-config';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductGallery,
    ProductConfig
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  // Vérifiez que ces images sont bien présentes
  productImages: string[] = [
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589003077984-89451d5a23f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558537348-c0f8e733ba6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ]

  activeTab: string = 'description';

  // Méthode pour changer d'onglet
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Liste des onglets disponibles
  tabs = [
    { id: 'description', label: 'Description' },
    { id: 'lieuFabrication', label: 'Lieu de fabrication' },
    { id: 'materiau', label: 'Matériau' },
    { id: 'dimensions', label: 'Dimensions' },
    { id: 'poids', label: 'Poids' },
    { id: 'coloris', label: 'Coloris' },
    { id: 'marquage', label: 'Marquage' },
    { id: 'emballage', label: 'Emballage' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'telechargements', label: 'Téléchargements' }
  ];
}
