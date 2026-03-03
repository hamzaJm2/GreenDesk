import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Category} from '../../models/category';
import {ProductCard} from '../../shared/product-card/product-card';
import {Product} from '../../models/product';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ProductService} from '../../services/product-service';

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


  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  selectedCategory: string = 'all';
  searchQuery: string = '';

  categoryOptions = [
    { value: 'all', label: 'Tous les produits' },
    { value: 'TISSUS', label: 'Gamme Tissus' },
    { value: 'ELECTRONIQUE', label: 'Gamme Électronique' },
    { value: 'PLASTIQUE', label: 'Gamme Plastique' }
  ];

  private pendingCategory: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Lire les queryParams
    this.route.queryParams.subscribe((params: any) => {
      const category = params['category'];
      if (category && category !== 'all') {
        this.pendingCategory = category.toUpperCase();
      }
    });

    // Charger les produits
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Forcer la détection de changement pour afficher le loader
    this.cdr.detectChanges();

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Produits chargés:', products);
        this.allProducts = products;

        // Appliquer le filtre si nécessaire
        if (this.pendingCategory) {
          this.selectedCategory = this.pendingCategory;
          this.filteredProducts = this.allProducts.filter(
            product => product.category === this.pendingCategory
          );
          this.pendingCategory = null;
        } else {
          this.filteredProducts = products;
        }

        this.isLoading = false;

        // FORCER la détection de changement APRÈS avoir mis à jour les données
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Impossible de charger les produits.';
        this.isLoading = false;

        // FORCER la détection de changement même en cas d'erreur
        this.cdr.detectChanges();
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
    this.cdr.detectChanges(); // Forcer la mise à jour
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value.toLowerCase();
    this.applyFilters();
    this.cdr.detectChanges(); // Forcer la mise à jour
  }

  applyFilters(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      const matchesCategory = this.selectedCategory === 'all' ||
        product.category === this.selectedCategory;

      const matchesSearch = this.searchQuery === '' ||
        product.name.toLowerCase().includes(this.searchQuery) ||
        product.description.toLowerCase().includes(this.searchQuery);

      return matchesCategory && matchesSearch;
    });
  }

  resetFilters(): void {
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.filteredProducts = this.allProducts;
    this.cdr.detectChanges(); // Forcer la mise à jour
  }

  refreshProducts(): void {
    this.loadProducts();
  }

  getFullImageUrl(imagePath: string): string {
    return `http://localhost:8080/${imagePath}`;
  }
}
