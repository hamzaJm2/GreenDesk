import { Component } from '@angular/core';
import {Category} from '../../models/category';
import {ProductCard} from '../../shared/product-card/product-card';

@Component({
  selector: 'app-boutique',
  imports: [
    ProductCard
  ],
  templateUrl: './boutique.html',
  styleUrl: './boutique.scss',
})
export class Boutique {
  categories: Category[] = [
    {
      id: 'box',
      title: 'Box échantillons',
      description: 'Découvrez nos coffrets découverte pour tester nos produits',
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: 12,
      route: '/boutique/box',
      color: 'var(--c-green-teal)'
    },
    {
      id: 'plastique',
      title: 'Gamme plastique',
      description: 'Produits durables et innovants en plastique recyclé',
      image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: 24,
      route: '/boutique/plastique',
      color: 'var(--c-green-dark)'
    },
    {
      id: 'electronique',
      title: 'Gamme électronique',
      description: 'Objets connectés et accessoires high-tech',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: 18,
      route: '/boutique/electronique',
      color: 'var(--c-gold)'
    },
    {
      id: 'tissus',
      title: 'Gamme tissus',
      description: 'Accessoires textiles éco-responsables',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: 15,
      route: '/boutique/tissus',
      color: 'var(--c-beige)'
    }
  ];

}
