import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import { ProductGallery } from '../../shared/product-gallery/product-gallery';
import {ProductService} from '../../services/product-service';
import {Product} from '../../models/product';
import {ProductTab} from '../../models/ProductTab';
import {DomSanitizer, SafeHtml, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import {CartService} from '../../services/cart-service';
import {FindOptionTierPipe, FindTierPipe} from '../../shared/pipes/find-tier.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductGallery,
    FindTierPipe,
    FindOptionTierPipe,

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

  // ── Grille tarifaire ──────────────────────────────────────────────────────
  pricingGrid: PricingGridResponse | null = null;
  isLoadingGrid = false;

  // Simulateur
  selectedVariantIndex = 0;
  selectedOptionIndices: number[] = [];
  selectedQty: number | null = null;
  selectedZone = 'FR';

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

        // Onglets depuis product.tabs
        this.productTabs = product.tabs || [];
        if (this.productTabs.length > 0) {
          this.activeTab = this.productTabs[0].tabKey;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
        this.loadPricingGrid(productId);
      },
      error: (error) => {
        console.error('Erreur chargement produit:', error);
        this.errorMessage = 'Impossible de charger le produit.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPricingGrid(productId: number): void {
    this.isLoadingGrid = true;
    this.productService.getPricingGrid(productId).subscribe({
      next: (grid: PricingGridResponse) => {
        this.pricingGrid = grid;
        this.selectedQty = grid.availableQties?.[0] ?? null;
        const zones = this.getShippingZones();
        this.selectedZone = zones.includes('FR') ? 'FR' : (zones[0] ?? 'FR');
        this.isLoadingGrid = false;

        Promise.resolve().then(() => this.cdr.detectChanges());
      },
      error: () => {
        this.pricingGrid = null;
        this.isLoadingGrid = false;
        Promise.resolve().then(() => this.cdr.detectChanges());
      }
    });
  }
  // ── Helpers grille ────────────────────────────────────────────────────────

  getShippingZones(): string[] {
    if (!this.pricingGrid) return [];
    return [...new Set(this.pricingGrid.shippingTiers.map(s => s.zone))];
  }

  getShippingCost(qty: number, zone: string): number | null {
    if (!this.pricingGrid) return null;
    return this.pricingGrid.shippingTiers.find(s => s.qty === qty && s.zone === zone)?.fixedCost ?? null;
  }

  toggleOption(index: number): void {
    const i = this.selectedOptionIndices.indexOf(index);
    if (i >= 0) this.selectedOptionIndices.splice(i, 1);
    else this.selectedOptionIndices.push(index);
    this.cdr.detectChanges();
  }

  isOptionSelected(index: number): boolean {
    return this.selectedOptionIndices.includes(index);
  }

  getUnitBase(): number {
    if (!this.pricingGrid || !this.selectedQty) return 0;
    const variant = this.pricingGrid.baseVariants[this.selectedVariantIndex];
    return variant?.tiers.find(t => t.qty === this.selectedQty)?.unitPrice ?? 0;
  }

  getOptionSurcharge(): number {
    if (!this.pricingGrid || !this.selectedQty) return 0;
    return this.selectedOptionIndices.reduce((sum, idx) => {
      const tier = this.pricingGrid!.optionGroups[idx]?.tiers.find(t => t.qty === this.selectedQty);
      return sum + (tier?.surcharge ?? 0);
    }, 0);
  }

  getTaxPerUnit(): number {
    return this.pricingGrid?.taxes.reduce((sum, t) => sum + t.amountPerUnit, 0) ?? 0;
  }

  getUnitTotal(): number {
    return this.getUnitBase() + this.getOptionSurcharge() + this.getTaxPerUnit();
  }

  getSubtotal(): number {
    return this.getUnitTotal() * (this.selectedQty ?? 0);
  }

  getShipping(): number {
    if (!this.selectedQty) return 0;
    return this.getShippingCost(this.selectedQty, this.selectedZone) ?? 0;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping();
  }


  setActiveTab(tabKey: string): void {
    this.activeTab = tabKey;
    this.cdr.detectChanges();
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

  // ─────────────────────────────────────────────
  // ✅ Vidéo YouTube : transforme l'URL en embed
  // ─────────────────────────────────────────────
  getYoutubeEmbedUrl(url: string): SafeResourceUrl {
    let videoId = '';

    const watchMatch = url.match(/[?&]v=([^&#]+)/);
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/);

    if (watchMatch)      videoId = watchMatch[1];
    else if (shortMatch) videoId = shortMatch[1];
    else if (embedMatch) videoId = embedMatch[1];

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // ─────────────────────────────────────────────────────
  // ✅ Vidéo locale → SafeUrl pour <video [src]>
  //    (SafeResourceUrl ne fonctionne PAS avec <video>)
  // ─────────────────────────────────────────────────────
  getVideoUrl(videoPath: string | null | undefined): SafeUrl {
    if (!videoPath) return '';


    const cleanPath = videoPath.startsWith('/') ? videoPath.slice(1) : videoPath;

    const fullUrl = cleanPath.startsWith('http')
      ? cleanPath
      : this.baseUrl + cleanPath;

    return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
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

  isStructuredTab(tabKey: string): boolean {
    const structured = ['dimensions', 'poids', 'marquage', 'emballage',
      'coloris', 'certifications', 'telechargements'];
    return structured.includes(tabKey);
  }

  /** Parse le contenu JSON d'un tab — retourne null si texte libre */
  parseTabContent(content: string): any | null {
    if (!content) return null;
    try {
      const parsed = JSON.parse(content);
      return typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  /** Retourne le tab actif */
  get activeTabObj(): ProductTab | null {
    return this.productTabs.find(t => t.tabKey === this.activeTab) ?? null;
  }

  /** Parse le contenu du tab actif */
  get activeTabParsed(): any | null {
    if (!this.activeTabObj) return null;
    return this.parseTabContent(this.activeTabObj.content);
  }

// ════════════════════════════════════════════════════════════════════
// REMPLACER getActiveTabContent() par :
// ════════════════════════════════════════════════════════════════════

  getActiveTabContent(): SafeHtml | string {
    const tab = this.activeTabObj;
    if (!tab?.content) return '';
    // Si c'est un tab structuré, ne pas retourner comme HTML
    if (this.isStructuredTab(tab.tabKey)) return '';
    if (tab.content.includes('<')) {
      return this.sanitizer.bypassSecurityTrustHtml(tab.content);
    }
    return tab.content;
  }

}
