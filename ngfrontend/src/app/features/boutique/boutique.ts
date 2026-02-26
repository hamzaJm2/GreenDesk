import {Component, OnInit} from '@angular/core';
import {Category} from '../../models/category';
import {ProductCard} from '../../shared/product-card/product-card';
import {Product} from '../../models/product';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-boutique',
  imports: [
    CommonModule,
    RouterModule,
    ProductCard
  ],
  templateUrl: './boutique.html',
  styleUrl: './boutique.scss',
})
export class Boutique implements OnInit {



  // Le code existant avec ngOnInit qui lit queryParams est déjà bon

  categories: Category[] = [
    {
      id: 'box',
      title: 'Box échantillons',
      description: 'Découvrez nos coffrets découverte',
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: 12,
      route: '/boutique/box',
      color: 'var(--c-green-teal)'
    },
    {
      id: 'plastique',
      title: 'Gamme plastique',
      description: 'Produits durables et innovants',
      image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: 24,
      route: '/boutique/plastique',
      color: 'var(--c-green-dark)'
    },
    {
      id: 'electronique',
      title: 'Gamme électronique',
      description: 'Objets connectés et accessoires',
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

  // Liste complète des produits
  allProducts: Product[] = [
    // Box échantillons
    {
      id: 1,
      name: 'Box Découverte Audio',
      category: 'box',
      categoryName: 'Box échantillons',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Casque, écouteurs et accessoires audio',
      isNew: true,
      deliveryPrice: 0,
      gallery: [],
      features: []
    },
    {
      id: 2,
      name: 'Box Accessoires Mobiles',
      category: 'box',
      categoryName: 'Box échantillons',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Coques, câbles, supports',
      deliveryPrice: 0,
      gallery: [],
      features: [],
      isNew: false
    },
    {
      id: 3,
      name: 'Box Studio Créatif',
      category: 'box',
      categoryName: 'Box échantillons',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Micro, filtre, accessoires studio',
      deliveryPrice: 0,
      gallery: [],
      features: [],
      isNew: false
    },

    // Gamme plastique
    {
      id: 4,
      name: 'Support Téléphone Universel',
      category: 'plastique',
      categoryName: 'Gamme plastique',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Support ajustable en plastique recyclé',
      deliveryPrice: 0,
      gallery: [],
      features: [],
      isNew: false
    },
    {
      id: 5,
      name: 'Boîte de Rangement',
      category: 'plastique',
      categoryName: 'Gamme plastique',
      price: 9.99,
      image: 'https://images.unsplash.com/photo-1621798450487-71c285f2a28c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Boîte modulable pour câbles et accessoires',
      deliveryPrice: 0,
      gallery: [],
      features: [],
      isNew: false
    },
    {
      id: 6,
      name: 'Support Tablette',
      category: 'plastique',
      categoryName: 'Gamme plastique',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1587037542794-51f15b1f6a3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Support ergonomique pour tablette',
      isNew: true,
      deliveryPrice: 0,
      gallery: [],
      features: []
    },

    // Gamme électronique
    {
      id: 7,
      name: 'Enceinte Bluetooth Portable',
      category: 'electronique',
      categoryName: 'Gamme électronique',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Enceinte nomade 10W, batterie 10h',
      deliveryPrice: 0,
      gallery: [],
      features: [],
      isNew: false
    },
    {
      id: 8,
      name: 'Casque Audio Sans Fil',
      category: 'electronique',
      categoryName: 'Gamme électronique',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Casque Bluetooth avec réduction de bruit',
      deliveryPrice: 0,
      gallery: [],
      features: [],
      isNew: false
    },
    {
      id: 9,
      name: 'Chargeur Sans Fil',
      category: 'electronique',
      categoryName: 'Gamme électronique',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Chargeur rapide 15W pour smartphones',
      isNew: true,
      deliveryPrice: 0,
      gallery: [],
      features: []
    },

    // Gamme tissus
    {
      id: 10,
      name: 'Sacoche pour Ordinateur',
      category: 'tissus',
      categoryName: 'Gamme tissus',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Sacoche en tissu recyclé 13-15 pouces',
      deliveryPrice: 0,
      gallery: [],
      features: [],
      isNew: false
    },
    {
      id: 11,
      name: 'Housse pour Tablette',
      category: 'tissus',
      categoryName: 'Gamme tissus',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Housse rembourrée en coton bio',
      deliveryPrice: 0,
      gallery: [],
      features: [],
      isNew: false
    },
    {
      id: 12,
      name: 'Pochette Câbles',
      category: 'tissus',
      categoryName: 'Gamme tissus',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Pochette de rangement pour câbles',
      deliveryPrice: 0,
      gallery: [],
      features: [],
      isNew: false
    }
  ];

  // Produits filtrés à afficher
  filteredProducts: Product[] = this.allProducts;

  // Filtres actifs
  selectedCategory: string = 'all';
  searchQuery: string = '';

  // Options de catégorie pour le filtre
  categoryOptions = [
    { value: 'all', label: 'Tous les produits' },
    { value: 'box', label: 'Box échantillons' },
    { value: 'plastique', label: 'Gamme plastique' },
    { value: 'electronique', label: 'Gamme électronique' },
    { value: 'tissus', label: 'Gamme tissus' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      const category = params['category'];
      if (category && category !== 'all') {
        this.selectedCategory = category;
        this.applyFilters();
      }
    });
  }


  // Filtrer par catégorie
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  // Recherche
  onSearch(event: any): void {
    this.searchQuery = event.target.value.toLowerCase();
    this.applyFilters();
  }

  // Appliquer tous les filtres
  applyFilters(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      // Filtre catégorie
      const matchesCategory = this.selectedCategory === 'all' || product.category === this.selectedCategory;

      // Filtre recherche
      const matchesSearch = this.searchQuery === '' ||
        product.name.toLowerCase().includes(this.searchQuery) ||
        product.description.toLowerCase().includes(this.searchQuery);

      return matchesCategory && matchesSearch;
    });
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.filteredProducts = this.allProducts;
  }
}
