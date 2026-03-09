import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import { ProductGallery } from '../../shared/product-gallery/product-gallery';
import { ProductConfig } from '../product-config/product-config';
import {ProductService} from '../../services/product-service';
import {Product} from '../../models/product';
import {ProductTab} from '../../models/ProductTab';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

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
export class ProductDetail implements OnInit {
  product: Product | null = null;

  // Images fusionnées (principale + galerie + réalisations)
  allImages: string[] = [];

  // État de chargement
  isLoading: boolean = true;
  errorMessage: string = '';

  // Onglets disponibles
  tabs = [
    {id: 'description', label: 'Description'},
    {id: 'lieuFabrication', label: 'Lieu de fabrication'},
    {id: 'materiau', label: 'Matériau'},
    {id: 'dimensions', label: 'Dimensions'},
    {id: 'poids', label: 'Poids'},
    {id: 'coloris', label: 'Coloris'},
    {id: 'marquage', label: 'Marquage'},
    {id: 'emballage', label: 'Emballage'},
    {id: 'certifications', label: 'Certifications'},
    {id: 'telechargements', label: 'Téléchargements'}
  ];
  productTabs: ProductTab[] = []
  activeTab: string = 'description';

  // URL de base pour les images
  private baseUrl: string = 'http://localhost:8080/';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef ,
    private sanitizer: DomSanitizer

  ) {
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(parseInt(id));
    } else {
      this.errorMessage = 'ID de produit manquant';
      this.isLoading = false;
      this.cdr.detectChanges(); // Forcer la détection pour afficher l'erreur
    }
  }

  loadProduct(productId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    // 1. Charger le produit
    this.productService.getProductById(productId).subscribe({
      next: (product: any) => {
        console.log('Produit chargé:', product);
        this.product = product;

        // Fusionner les images
        this.allImages = [
          this.baseUrl + product.image,
          ...(product.gallery || []).map((img: string) => this.baseUrl + img),
        ];

        // 2. Charger les onglets du produit via l'endpoint spécifique
        this.loadProductTabs(productId);
      },
      error: (error) => {
        console.error('Erreur chargement produit:', error);
        this.errorMessage = 'Impossible de charger le produit.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadProductTabs(productId: number): void {
    this.productService.getProductTabs(productId).subscribe({
      next: (tabs: ProductTab[]) => {
        console.log('Onglets du produit chargés:', tabs);

        // Stocker directement les onglets
        this.productTabs = tabs;

        // Définir le premier onglet comme actif
        if (this.productTabs.length > 0) {
          this.activeTab = this.productTabs[0].tabKey;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement onglets:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Méthode pour changer d'onglet
  setActiveTab(tabKey: string): void {
    this.activeTab = tabKey;
    this.cdr.detectChanges();
  }

  // Obtenir le contenu de l'onglet actif
  getActiveTabContent(): SafeHtml | string {
    const activeTab = this.productTabs.find(tab => tab.tabKey === this.activeTab);
    if (activeTab?.content) {
      // Si le contenu contient du HTML, le sécuriser
      return this.sanitizer.bypassSecurityTrustHtml(activeTab.content);
    }
    return '';
  }

  // Helper pour formater le contenu avec des retours à la ligne
  formatContent(content: string): string[] {
    return content.split('\n').filter(line => line.trim() !== '');
  }

  // Helper pour les URLs d'images
  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'https://via.placeholder.com/400x400?text=Image+non+disponible';
    return this.baseUrl + imagePath;
  }

  // Prix formaté
  get formattedPrice(): string {
    if (!this.product?.price) return 'Sur devis';
    return this.product.price.toFixed(2) + ' €';
  }

  // Gestionnaire d'erreur d'image
  handleImageError(event: any): void {
    console.error('Erreur de chargement d\'image:', event.target.src);
    event.target.src = 'https://via.placeholder.com/400x400?text=Image+non+disponible';
    this.cdr.detectChanges();
  }

}
