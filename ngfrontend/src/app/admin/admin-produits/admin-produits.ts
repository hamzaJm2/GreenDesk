import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product-service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-produits',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-produits.html',
  styleUrls: ['./admin-produits.scss']
})
export class AdminProduitsComponent implements OnInit {

  products: any[] = [];
  filteredProducts: any[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  deletingId: number | null = null;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les produits.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredProducts = q
      ? this.products.filter(p => p.name.toLowerCase().includes(q))
      : [...this.products];
    this.cdr.detectChanges();
  }

  delete(id: number, name: string): void {
    if (!confirm(`Supprimer "${name}" définitivement ?`)) return;
    this.deletingId = id;
    this.productService.deleteProduct(id).subscribe({
      next: () => { this.deletingId = null; this.loadProducts(); },
      error: () => { this.deletingId = null; this.cdr.detectChanges(); }
    });
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl}/${path}`;
  }

  getLabelBadge(labelType: string): { text: string; color: string } {
    if (labelType === 'OFG') return { text: 'OFG', color: '#1B6B3A' };
    if (labelType === 'FIF') return { text: 'FIF', color: '#1B4D8E' };
    return { text: 'Aucun', color: '#888' };
  }
}
