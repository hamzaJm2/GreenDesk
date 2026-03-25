import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import { ProductGallery } from '../../shared/product-gallery/product-gallery';
import {ProductService} from '../../services/product-service';
import {Product} from '../../models/product';
import {ProductTab} from '../../models/ProductTab';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {CartService} from '../../services/cart-service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductGallery,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  allImages: string[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  isAddingToCart = false;
  cartSuccess = false;
  productTabs: ProductTab[] = [];
  activeTab: string = '';

  private baseUrl: string = 'http://localhost:8080/';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(parseInt(id));
    } else {
      this.errorMessage = 'ID de produit manquant';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadProduct(productId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.productService.getProductById(productId).subscribe({
      next: (product: any) => {
        this.product = product;

        // Images : principale + galerie
        this.allImages = [
          this.baseUrl + product.image,
          ...(product.gallery || []).map((img: string) => this.baseUrl + img),
        ];

        // Onglets directement depuis product.tabs
        this.productTabs = product.tabs || [];
        if (this.productTabs.length > 0) {
          this.activeTab = this.productTabs[0].tabKey;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement produit:', error);
        this.errorMessage = 'Impossible de charger le produit.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setActiveTab(tabKey: string): void {
    this.activeTab = tabKey;
    this.cdr.detectChanges();
  }

  getActiveTabContent(): SafeHtml | string {
    const activeTab = this.productTabs.find(tab => tab.tabKey === this.activeTab);
    if (activeTab?.content) {
      return this.sanitizer.bypassSecurityTrustHtml(activeTab.content);
    }
    return '';
  }

  formatContent(content: string): string[] {
    return content.split('\n').filter(line => line.trim() !== '');
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'https://via.placeholder.com/400x400?text=Image+non+disponible';
    return this.baseUrl + imagePath;
  }

  get formattedPrice(): string {
    if (!this.product?.price) return 'Sur devis';
    return this.product.price.toFixed(2) + ' €';
  }

  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x400?text=Image+non+disponible';
    this.cdr.detectChanges();
  }

  addToCart(): void {
    if (!this.product) return;
    this.isAddingToCart = true;
    this.cartService.addItem(this.product.id, 1).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.cartSuccess = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cartSuccess = false;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: () => {
        this.isAddingToCart = false;
        this.cdr.detectChanges();
      }
    });
  }
}
