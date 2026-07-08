import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';

import { ProductService } from '../../services/product-service';
import { UploadService } from '../../services/upload-service';
import { CategoryService } from '../../services/category-service';
import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { ProductTabDefinition } from '../../models/productTabDefinition';
import {SafeUrlPipe} from '../../shared/pipes/safe-url.pipe';
import {BaseVariantForm} from '../../models/BaseVariantForm';
import {OptionGroupForm} from '../../models/OptionGroupForm';
import {ShippingTierForm} from '../../models/ShippingTierForm';
import {TaxEntryForm} from '../../models/TaxEntryForm';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,SafeUrlPipe],
  templateUrl: './product-create.html',
  styleUrls: ['./product-create.scss']
})
export class ProductCreateComponent implements OnInit {

  productForm: FormGroup;

  categories: Category[] = [];
  isLoadingCategories = true;

  tabDefinitions: ProductTabDefinition[] = [];
  isLoadingTabs = true;

  // Onglets depuis tabDefinitions (prédéfinis)
  selectedTabs: { tabId: number; tabKey: string; tabLabel: string; content: string }[] = [];

  // Onglets libres (personnalisés)
  customTabs: { tabKey: string; tabLabel: string; content: string }[] = [];

  attributes: { name: string; values: { value: string; extraPrice: number }[] }[] = [];

  uploadingMainImage = false;
  uploadingGallery = false;
  uploadingAchievements = false;

  mainImageFile: File | null = null;
  mainImagePreview: string | null = null;
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];
  achievementFiles: File[] = [];
  achievementPreviews: string[] = [];

  isSubmitting = false;
  currentStep:number = 1;
  totalSteps:number = 6;
  successMessage = '';
  errorMessage = '';

  videoFile: File | null = null;
  videoPreview: string | null = null;
  youtubeUrl: string = '';
  youtubeEmbedUrl: string | null = null;

  videoType: 'upload' | 'youtube' | null = null;
  uploadingVideo = false;

  // ── Grille Tarifaire State ─────────────────────────────────────────────

  // Quantités disponibles (partagées par toutes les variantes et options)
  availableQties: number[] = [50, 100, 250, 500, 1000, 2000, 5000];
  newQtyInput: number | null = null;

  baseVariants: BaseVariantForm[] = [];
  optionGroups: OptionGroupForm[] = [];
  shippingTiers: ShippingTierForm[] = [];
  taxes: TaxEntryForm[] = [];

  deliveryDays: string = '';
  gridNotes: string = '';

  // Pour le tableau de prévisualisation
  previewSelectedVariantIndex = 0;
  previewSelectedOptionIndices: number[] = [];
  previewQty: number | null = null;
  previewZone: string = 'FR';




// Map pour les fichiers PDF par tabKey
  dimensionsData: { items: { nom: string; valeur: string }[] } = { items: [] };

// Poids
  poidsData: { valeur: string; unite: 'g' | 'kg' } = { valeur: '', unite: 'g' };

// Marquage
  marquageData: { type: string; dimensions: string; nominatif: boolean } =
    { type: '', dimensions: '', nominatif: false };

// Emballage
  emballageData: { description: string; dimensions: { label: string; valeur: string }[] } =
    { description: '', dimensions: [] };

// Coloris disponibles — label : valeur
  colorisItems: { label: string; valeur: string }[] = [];

  addColorisItem(): void {
    this.colorisItems.push({ label: '', valeur: '' });
  }

  removeColorisItem(index: number): void {
    this.colorisItems.splice(index, 1);
  }
// Certifications / Téléchargements — map tabKey → liste de docs

// Certifications / Téléchargements — map tabKey → liste de docs
  pdfDocsMap: Record<string, { nom: string; type: 'pdf' | 'url'; file: File | null; url: string }[]> = {};



  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private uploadService: UploadService,
    private categoryService: CategoryService,
    private router: Router,
    private cdr: ChangeDetectorRef

  ) {
    this.productForm = this.fb.group({
      name:          ['', [Validators.required, Validators.minLength(3)]],
      category:      ['', Validators.required],
      categoryTitle: [''],
      categoryId:    [null, Validators.required],
      price:         [null, [Validators.required, Validators.min(0)]],
      shortDescription: ['', [Validators.required, Validators.minLength(3)]],
      longDescription:  ['', [Validators.required, Validators.minLength(10)]],
      features:      this.fb.array([]),
      isNew:         [true]
    });
    this.addFeature();
  }

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => {
        this.categories = cats.map(cat => ({
          ...cat,
          productCategory: cat.productCategory || cat.title.toLowerCase().replace(/[^a-z0-9]/g, '_')
        }));
        this.isLoadingCategories = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les catégories.';
        this.isLoadingCategories = false;
      }
    });

    this.productService.getTabDefinitions().subscribe({
      next: (tabs) => {
        this.tabDefinitions = tabs;
        this.isLoadingTabs = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingTabs = false; }
    });
  }

  // ── Grille Tarifaire Methods ───────────────────────────────────────────

  addQty(): void {
    if (!this.newQtyInput || this.newQtyInput <= 0) return;
    if (this.availableQties.includes(this.newQtyInput)) return;

    this.availableQties = [...this.availableQties, this.newQtyInput].sort((a, b) => a - b);

    // Ajouter le palier à toutes les variantes existantes
    this.baseVariants.forEach(v => {
      v.tiers = this.availableQties.map(qty => ({
        qty,
        unitPrice: v.tiers.find(t => t.qty === qty)?.unitPrice ?? null
      }));
    });

    // Ajouter le palier à tous les groupes d'options existants
    this.optionGroups.forEach(og => {
      og.tiers = this.availableQties.map(qty => ({
        qty,
        surcharge: og.tiers.find(t => t.qty === qty)?.surcharge ?? null
      }));
    });

    // Ajouter le palier aux frais de port par zone
    const zones = [...new Set(this.shippingTiers.map(s => s.zone))];
    zones.forEach(zone => {
      if (!this.shippingTiers.find(s => s.qty === this.newQtyInput && s.zone === zone)) {
        this.shippingTiers.push({ qty: this.newQtyInput!, fixedCost: null, zone });
      }
    });

    this.newQtyInput = null;
    this.previewQty = this.availableQties[0];
    this.cdr.detectChanges();
  }

  removeQty(qty: number): void {
    if (this.availableQties.length <= 1) return;
    this.availableQties = this.availableQties.filter(q => q !== qty);
    this.baseVariants.forEach(v => { v.tiers = v.tiers.filter(t => t.qty !== qty); });
    this.optionGroups.forEach(og => { og.tiers = og.tiers.filter(t => t.qty !== qty); });
    this.shippingTiers = this.shippingTiers.filter(s => s.qty !== qty);
    if (this.previewQty === qty) this.previewQty = this.availableQties[0] ?? null;
    this.cdr.detectChanges();
  }

  addBaseVariant(): void {
    this.baseVariants.push({
      name: '',
      displayOrder: this.baseVariants.length,
      tiers: this.availableQties.map(qty => ({ qty, unitPrice: null })),
      deliveryDays: '' // ✅ ajouté
    });
  }

  removeBaseVariant(index: number): void {
    this.baseVariants.splice(index, 1);
    if (this.previewSelectedVariantIndex >= this.baseVariants.length) {
      this.previewSelectedVariantIndex = Math.max(0, this.baseVariants.length - 1);
    }
  }

  addOptionGroup(): void {
    this.optionGroups.push({
      name: '',
      required: false,
      additionalWeeks: null,
      tiers: this.availableQties.map(qty => ({ qty, surcharge: null }))
    });
  }

  removeOptionGroup(index: number): void {
    this.optionGroups.splice(index, 1);
    this.previewSelectedOptionIndices = this.previewSelectedOptionIndices.filter(i => i !== index);
  }

  addShippingZone(zone: string): void {
    if (this.shippingTiers.some(s => s.zone === zone)) return;
    this.availableQties.forEach(qty => {
      this.shippingTiers.push({ qty, fixedCost: null, zone });
    });
  }

  removeShippingZone(zone: string): void {
    this.shippingTiers = this.shippingTiers.filter(s => s.zone !== zone);
  }

  getShippingZones(): string[] {
    return [...new Set(this.shippingTiers.map(s => s.zone))];
  }

  getShippingForZone(zone: string): ShippingTierForm[] {
    return this.availableQties.map(qty => {
      const existing = this.shippingTiers.find(s => s.qty === qty && s.zone === zone);
      if (!existing) {
        const newTier: ShippingTierForm = { qty, fixedCost: null, zone };
        this.shippingTiers.push(newTier);
        return newTier;
      }
      return existing;
    });
  }

  addTax(): void {
    this.taxes.push({ taxName: '', amountPerUnit: null });
  }

  removeTax(index: number): void {
    this.taxes.splice(index, 1);
  }

  togglePreviewOption(index: number): void {
    const i = this.previewSelectedOptionIndices.indexOf(index);
    if (i >= 0) {
      this.previewSelectedOptionIndices.splice(i, 1);
    } else {
      this.previewSelectedOptionIndices.push(index);
    }
  }

  isPreviewOptionSelected(index: number): boolean {
    return this.previewSelectedOptionIndices.includes(index);
  }

  // Calcul pour la prévisualisation
  getPreviewUnitBase(): number {
    if (!this.previewQty || !this.baseVariants[this.previewSelectedVariantIndex]) return 0;
    const tier = this.baseVariants[this.previewSelectedVariantIndex].tiers.find(t => t.qty === this.previewQty);
    return tier?.unitPrice ?? 0;
  }

  getPreviewOptionSurcharge(): number {
    if (!this.previewQty) return 0;
    return this.previewSelectedOptionIndices.reduce((sum, idx) => {
      const tier = this.optionGroups[idx]?.tiers.find(t => t.qty === this.previewQty);
      return sum + (tier?.surcharge ?? 0);
    }, 0);
  }

  getPreviewTaxPerUnit(): number {
    return this.taxes.reduce((sum, t) => sum + (t.amountPerUnit ?? 0), 0);
  }

  getPreviewUnitTotal(): number {
    return this.getPreviewUnitBase() + this.getPreviewOptionSurcharge() + this.getPreviewTaxPerUnit();
  }

  getPreviewSubtotal(): number {
    return this.getPreviewUnitTotal() * (this.previewQty ?? 0);
  }

  getPreviewShipping(): number {
    if (!this.previewQty) return 0;
    const tier = this.shippingTiers.find(s => s.qty === this.previewQty && s.zone === this.previewZone);
    return tier?.fixedCost ?? 0;
  }

  getPreviewTotal(): number {
    return this.getPreviewSubtotal() + this.getPreviewShipping();
  }

  // Construit le payload pour l'API
  buildPricingGridPayload() {
    return {
      deliveryDays: this.deliveryDays,
      notes: this.gridNotes,
      baseVariants: this.baseVariants.map((v, i) => ({
        name: v.name,
        displayOrder: i,
        deliveryDays: v.deliveryDays,
        tiers: v.tiers.map(t => ({ qty: t.qty, unitPrice: t.unitPrice ?? 0 }))
      })),
      optionGroups: this.optionGroups.map(og => ({
        name: og.name,
        required: og.required,
        additionalWeeks: og.additionalWeeks,
        tiers: og.tiers.map(t => ({ qty: t.qty, surcharge: t.surcharge }))
      })),
      shippingTiers: this.shippingTiers.map(s => ({
        qty: s.qty,
        fixedCost: s.fixedCost ?? 0,
        zone: s.zone
      })),
      taxes: this.taxes.map(t => ({
        taxName: t.taxName,
        amountPerUnit: t.amountPerUnit ?? 0
      }))
    };
  }


  // Video

  selectVideoType(type: 'upload' | 'youtube' | null): void {
    // Si on change de type, on efface les données de l'ancien type
    if (this.videoType !== type) {
      this.videoFile = null;
      this.videoPreview = null;
      this.youtubeUrl = '';
      this.youtubeEmbedUrl = null;
      this.uploadingVideo = false;
      this.errorMessage = '';
    }

    this.videoType = type;
    this.cdr.detectChanges();
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      this.errorMessage = 'Le fichier doit être une vidéo.';
      input.value = '';
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      this.errorMessage = 'La vidéo ne doit pas dépasser 100 Mo.';
      input.value = '';
      return;
    }

    this.uploadingVideo = true;
    this.errorMessage = '';
    this.videoType = 'upload';
    this.youtubeUrl = '';
    this.youtubeEmbedUrl = null;
    this.cdr.detectChanges();

    this.videoFile = file;
    this.readVideoPreview(file, (result) => {
      this.videoPreview = result;
      this.uploadingVideo = false;
      this.cdr.detectChanges();
    });

    input.value = '';
  }

// Méthode pour YouTube
  onYoutubeUrlChange(value: string): void {
    this.youtubeUrl = value;
    if (!this.youtubeUrl) {
      this.youtubeEmbedUrl = null;
      return;
    }

    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = this.youtubeUrl.match(youtubeRegex);

    if (match && match[1]) {
      const videoId = match[1];
      this.youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
      this.errorMessage = '';
    } else {
      this.youtubeEmbedUrl = null;
      this.errorMessage = 'URL YouTube invalide.';
    }
    this.cdr.detectChanges();
  }

// Supprimer la vidéo
  removeVideo(): void {
    this.videoFile = null;
    this.videoPreview = null;
    this.youtubeUrl = '';
    this.youtubeEmbedUrl = null;
    this.videoType = null;
    this.cdr.detectChanges();
  }

// Lecture preview vidéo
  private readVideoPreview(file: File, callback: (result: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  // ── Features ───────────────────────────────────────────────────────────────

  get features(): FormArray {
    return this.productForm.get('features') as FormArray;
  }

  addFeature(): void {
    this.features.push(this.fb.control('', Validators.required));
  }

  removeFeature(index: number): void {
    this.features.removeAt(index);
  }

  // ── Catégorie ──────────────────────────────────────────────────────────────

  onCategorySelect(cat: Category): void {
    this.productForm.patchValue({
      category:      cat.productCategory,  // ← Utiliser productCategory
      categoryTitle: cat.title,
      categoryId:    Number(cat.id)
    });

    // Forcer la validation
    this.productForm.get('category')?.updateValueAndValidity();
    this.productForm.get('categoryId')?.updateValueAndValidity();

    this.cdr.detectChanges();
  }

  // ── Onglets prédéfinis ─────────────────────────────────────────────────────

  isTabSelected(tabId: number): boolean {
    return this.selectedTabs.some(t => t.tabId === tabId);
  }

  toggleTab(tab: ProductTabDefinition): void {
    const index = this.selectedTabs.findIndex(t => t.tabId === tab.id);
    if (index >= 0) {
      this.selectedTabs.splice(index, 1);
    } else {
      this.selectedTabs.push({
        tabId:    tab.id,
        tabKey:   tab.tabKey,
        tabLabel: tab.label,
        content:  ''
      });
    }
  }

  updateTabContent(tabId: number, content: string): void {
    const tab = this.selectedTabs.find(t => t.tabId === tabId);
    if (tab) tab.content = content;
  }

  // ── Onglets libres ─────────────────────────────────────────────────────────

  addCustomTab(): void {
    this.customTabs.push({ tabKey: '', tabLabel: '', content: '' });
  }

  removeCustomTab(index: number): void {
    this.customTabs.splice(index, 1);
  }

  updateCustomTabLabel(index: number, label: string): void {
    this.customTabs[index].tabLabel = label;
    this.customTabs[index].tabKey = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  updateCustomTabContent(index: number, content: string): void {
    this.customTabs[index].content = content;
  }



  // ── Images ─────────────────────────────────────────────────────────────────

  // ── Images avec gestion robuste ─────────────────────────────────────────────────

  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.validateFile(file)) {
      input.value = ''; // Reset input
      return;
    }

    this.uploadingMainImage = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.mainImageFile = file;

    this.readPreview(file, (result) => {
      this.mainImagePreview = result;
      this.uploadingMainImage = false;
      this.cdr.detectChanges();
    });

    input.value = ''; // Reset input
  }

  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = null;
    this.cdr.detectChanges();
  }

  onGallerySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (files.length === 0) return;

    const valid = files.filter(f => this.validateFile(f));

    if (valid.length === 0) {
      input.value = '';
      return;
    }

    this.uploadingGallery = true;
    this.cdr.detectChanges();

    let processedCount = 0;

    valid.forEach(file => {
      this.readPreview(file, (result) => {
        // Créer de nouveaux tableaux pour déclencher la détection
        const newPreviews = [...this.galleryPreviews, result];
        const newFiles = [...this.galleryFiles, file];

        this.galleryPreviews = newPreviews;
        this.galleryFiles = newFiles;

        processedCount++;

        if (processedCount === valid.length) {
          this.uploadingGallery = false;
        }

        this.cdr.detectChanges();
      });
    });

    input.value = ''; // Reset input
  }

  removeGalleryImage(index: number): void {
    this.galleryFiles = this.galleryFiles.filter((_, i) => i !== index);
    this.galleryPreviews = this.galleryPreviews.filter((_, i) => i !== index);
    this.cdr.detectChanges();
  }

  onAchievementsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (files.length === 0) return;

    const valid = files.filter(f => this.validateFile(f));

    if (valid.length === 0) {
      input.value = '';
      return;
    }

    this.uploadingAchievements = true;
    this.cdr.detectChanges();

    let processedCount = 0;

    valid.forEach(file => {
      this.readPreview(file, (result) => {
        // Créer de nouveaux tableaux pour déclencher la détection
        const newPreviews = [...this.achievementPreviews, result];
        const newFiles = [...this.achievementFiles, file];

        this.achievementPreviews = newPreviews;
        this.achievementFiles = newFiles;

        processedCount++;

        if (processedCount === valid.length) {
          this.uploadingAchievements = false;
        }

        this.cdr.detectChanges();
      });
    });

    input.value = ''; // Reset input
  }

  removeAchievementImage(index: number): void {
    this.achievementFiles = this.achievementFiles.filter((_, i) => i !== index);
    this.achievementPreviews = this.achievementPreviews.filter((_, i) => i !== index);
    this.cdr.detectChanges();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  nextStep(): void {
    if (this.currentStep === 1) {
      this.productForm.markAllAsTouched();

      // Vérifier chaque champ requis
      const errors: string[] = [];

      if (!this.productForm.get('name')?.value || this.productForm.get('name')?.invalid) {
        errors.push('Nom du produit ');
      }
      if (!this.productForm.get('categoryId')?.value) {
        errors.push('Catégorie');
      }
      if (!this.productForm.get('price')?.value || this.productForm.get('price')?.invalid) {
        errors.push('Prix');
      }
      if (!this.productForm.get('shortDescription')?.value || this.productForm.get('shortDescription')?.invalid) {
        errors.push('Description courte ');
      }
      if (!this.productForm.get('longDescription')?.value || this.productForm.get('longDescription')?.invalid) {
        errors.push('Description longue ');
      }


      if (!this.productForm.valid) {
        this.errorMessage = `Veuillez remplir tous les champs obligatoires : ${errors.join(', ')}.`;
        return;
      }
    }
    if (this.currentStep === 2 && !this.mainImageFile) {
      this.errorMessage = "L'image principale est obligatoire.";
      return;
    }
    this.errorMessage = '';
    this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.productForm.invalid || !this.mainImageFile) {
      this.errorMessage = "Veuillez remplir tous les champs et ajouter l'image principale.";
      return;
    }
    this.isSubmitting = true; this.errorMessage = ''; this.successMessage = '';
    const productName = this.productForm.value.name.trim();
    const videoUpload$ = (this.videoType === 'upload' && this.videoFile)
      ? this.uploadService.uploadVideo(this.videoFile, productName)
      : Promise.resolve(null);

    forkJoin({
      main: this.uploadService.uploadMainImage(this.mainImageFile, productName),
      gallery: this.uploadService.uploadGallery(this.galleryFiles, productName),
      achievements: this.uploadService.uploadAchievements(this.achievementFiles, productName),
      video: videoUpload$
    }).pipe(
      switchMap(({ main, gallery, achievements, video }) => {
        const formValue = this.productForm.value;
        let videoData = null;
        if (this.videoType === 'youtube' && this.youtubeUrl) videoData = this.youtubeUrl;
        else if (this.videoType === 'upload' && video?.path) videoData = video.path;

        const productData: Omit<Product, 'id'> = {
          name: formValue.name,
          category: formValue.category,
          categoryTitle: formValue.categoryTitle,
          categoryId: formValue.categoryId,
          price: formValue.price,
          shortDescription: formValue.shortDescription,
          longDescription: formValue.longDescription,
          strengths: this.features.value.filter((f: string) => f.trim() !== ''),
          image: main.path,
          gallery: gallery.paths,
          achievements: achievements.paths,
          video: videoData ?? '',
          videoType: this.videoType,
          new: formValue.isNew,
          tabs: this.buildTabsPayload(),
          attributes: []
        };
        return this.productService.createProduct(productData);
      })
    ).subscribe({
      next: (created) => {
        if (this.baseVariants.length > 0) {
          const payload = this.buildPricingGridPayload();
          this.productService.createPricingGrid(created.id, payload).subscribe();
        }
        this.successMessage = 'Produit créé avec succès !';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/produit', created.id]), 2000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Une erreur est survenue lors de la création du produit.';
        this.isSubmitting = false;
      }
    });
  }


  /** Label affiché dans le header du tab */
  getTabTypeLabel(tabKey: string): string {
    const labels: Record<string, string> = {
      'dimensions':       'Champs structurés',
      'poids':            'Valeur',
      'marquage':         'Champs structurés',
      'emballage':        'Description + Dimensions',
      'coloris':          'Automatique',
      'certifications':   'Upload PDF',
      'telechargements':  'Upload PDF',
    };
    return labels[tabKey] ?? 'Texte libre';
  }






  private validateFile(file: File): boolean {
    if (!file.type.startsWith('image/')) { this.errorMessage = 'Le fichier doit être une image.'; return false; }
    if (file.size > 5 * 1024 * 1024) { this.errorMessage = "L'image ne doit pas dépasser 5 Mo."; return false; }
    return true;
  }

  private readPreview(file: File, callback: (result: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target?.result as string);
    reader.readAsDataURL(file);
  }












  isTextFreeTab(tabKey: string): boolean {
    const structured = ['dimensions', 'poids', 'marquage', 'emballage',
      'coloris', 'certifications', 'telechargements'];
    return !structured.includes(tabKey);
  }

// ── Dimensions ──────────────────────────────────────────────────────
  addDimensionItem(): void {
    this.dimensionsData.items.push({ nom: '', valeur: '' });
  }

  removeDimensionItem(index: number): void {
    this.dimensionsData.items.splice(index, 1);
  }

// ── Emballage dimensions ────────────────────────────────────────────
  addEmballageDimension(): void {
    this.emballageData.dimensions.push({ label: '', valeur: '' });
  }

  removeEmballageDimension(index: number): void {
    this.emballageData.dimensions.splice(index, 1);
  }

// ── Coloris disponibles ─────────────────────────────────────────────


// ── PDF Docs (certifications / téléchargements) ─────────────────────
  getPdfDocs(tabKey: string): { nom: string; type: 'pdf' | 'url'; file: File | null; url: string }[] {
    if (!this.pdfDocsMap[tabKey]) this.pdfDocsMap[tabKey] = [];
    return this.pdfDocsMap[tabKey];
  }

  addPdfDoc(tabKey: string): void {
    if (!this.pdfDocsMap[tabKey]) this.pdfDocsMap[tabKey] = [];
    this.pdfDocsMap[tabKey].push({ nom: '', type: 'pdf', file: null, url: '' });
  }

  removePdfDoc(tabKey: string, index: number): void {
    this.pdfDocsMap[tabKey]?.splice(index, 1);
    this.cdr.detectChanges();
  }

  onPdfFileSelected(event: Event, tabKey: string, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.pdfDocsMap[tabKey]) return;
    this.pdfDocsMap[tabKey][index].file = file;
    // Auto-remplir le nom si vide
    if (!this.pdfDocsMap[tabKey][index].nom) {
      this.pdfDocsMap[tabKey][index].nom = file.name.replace('.pdf', '');
    }
    input.value = '';
    this.cdr.detectChanges();
  }

// ── Sérialisation tabs pour le submit ───────────────────────────────
  private buildTabsPayload(): any[] {
    const tabs: any[] = [];

    for (const t of this.selectedTabs) {
      let content = t.content;

      switch (t.tabKey) {
        case 'dimensions':
          content = JSON.stringify(this.dimensionsData);
          break;
        case 'poids':
          content = JSON.stringify(this.poidsData);
          break;
        case 'marquage':
          content = JSON.stringify(this.marquageData);
          break;
        case 'emballage':
          content = JSON.stringify(this.emballageData);
          break;
        case 'coloris':
          content = JSON.stringify({ items: this.colorisItems });
          break;
        case 'certifications':
        case 'telechargements':
          // Stocker les noms des docs (les fichiers seront uploadés séparément)
          content = JSON.stringify({
            docs: (this.pdfDocsMap[t.tabKey] ?? []).map(d => ({
              nom: d.nom,
              fichier: d.file?.name ?? ''
            }))
          });
          break;
      }

      tabs.push({ id: 0, tabId: t.tabId, tabKey: t.tabKey, tabLabel: t.tabLabel, content });
    }

    for (const t of this.customTabs.filter(t => t.tabLabel.trim())) {
      tabs.push({ id: 0, tabId: null, tabKey: t.tabKey, tabLabel: t.tabLabel, content: t.content });
    }

    return tabs;
  }



}
