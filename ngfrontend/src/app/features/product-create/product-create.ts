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

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
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

  mainImageFile: File | null = null;
  mainImagePreview: string | null = null;
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];
  achievementFiles: File[] = [];
  achievementPreviews: string[] = [];

  isSubmitting = false;
  currentStep = 1;
  totalSteps = 6;
  successMessage = '';
  errorMessage = '';

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
      deliveryPrice: [null, [Validators.required, Validators.min(0)]],
      description:   ['', [Validators.required, Validators.minLength(10)]],
      features:      this.fb.array([]),
      isNew:         [true]
    });
    this.addFeature();
  }

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => {
        this.categories = [...cats];
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
      category:      cat.route,
      categoryTitle: cat.title,
      categoryId:    Number(cat.id)
    });
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

  // ── Attributs ──────────────────────────────────────────────────────────────

  addAttribute(): void {
    this.attributes.push({ name: '', values: [{ value: '', extraPrice: 0 }] });
  }

  removeAttribute(index: number): void {
    this.attributes.splice(index, 1);
  }

  addAttributeValue(attrIndex: number): void {
    this.attributes[attrIndex].values.push({ value: '', extraPrice: 0 });
  }

  removeAttributeValue(attrIndex: number, valueIndex: number): void {
    this.attributes[attrIndex].values.splice(valueIndex, 1);
  }

  updateAttributeName(index: number, name: string): void {
    this.attributes[index].name = name;
  }

  updateAttributeValue(attrIndex: number, valueIndex: number, value: string): void {
    this.attributes[attrIndex].values[valueIndex].value = value;
  }

  updateAttributeExtraPrice(attrIndex: number, valueIndex: number, price: number): void {
    this.attributes[attrIndex].values[valueIndex].extraPrice = price;
  }

  // ── Images ─────────────────────────────────────────────────────────────────

  onMainImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validateFile(file)) return;
    this.mainImageFile = file;
    this.errorMessage = '';
    this.readPreview(file, (result) => this.mainImagePreview = result);
  }

  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = null;
  }

  onGallerySelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    const valid = files.filter(f => this.validateFile(f));
    this.galleryFiles = [...this.galleryFiles, ...valid];
    valid.forEach(f => this.readPreview(f, (r) => this.galleryPreviews.push(r)));
  }

  removeGalleryImage(index: number): void {
    this.galleryFiles.splice(index, 1);
    this.galleryPreviews.splice(index, 1);
  }

  onAchievementsSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    const valid = files.filter(f => this.validateFile(f));
    this.achievementFiles = [...this.achievementFiles, ...valid];
    valid.forEach(f => this.readPreview(f, (r) => this.achievementPreviews.push(r)));
  }

  removeAchievementImage(index: number): void {
    this.achievementFiles.splice(index, 1);
    this.achievementPreviews.splice(index, 1);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  nextStep(): void {
    if (this.currentStep === 1) {
      this.productForm.markAllAsTouched();
      if (!this.productForm.valid) {
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
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

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const productName = this.productForm.value.name.trim();

    forkJoin({
      main:         this.uploadService.uploadMainImage(this.mainImageFile, productName),
      gallery:      this.uploadService.uploadGallery(this.galleryFiles, productName),
      achievements: this.uploadService.uploadAchievements(this.achievementFiles, productName)
    }).pipe(
      switchMap(({ main, gallery, achievements }) => {
        const formValue = this.productForm.value;

        // Fusionner onglets prédéfinis + onglets libres
        const allTabs = [
          // Onglets prédéfinis (avec tabId)
          ...this.selectedTabs.map(t => ({
            id:       0,
            tabId:    t.tabId,
            tabKey:   t.tabKey,
            tabLabel: t.tabLabel,
            content:  t.content
          })),
          // Onglets libres (sans tabId → null)
          ...this.customTabs
            .filter(t => t.tabLabel.trim() !== '')
            .map(t => ({
              id:       0,
              tabId:    null as any,
              tabKey:   t.tabKey,
              tabLabel: t.tabLabel,
              content:  t.content
            }))
        ];

        const productData: Omit<Product, 'id'> = {
          name:          formValue.name,
          category:      formValue.category,
          categoryTitle: formValue.categoryTitle,
          categoryId:    formValue.categoryId,
          price:         formValue.price,
          deliveryPrice: formValue.deliveryPrice,
          description:   formValue.description,
          image:         main.path,
          gallery:       gallery.paths,
          achievements:  achievements.paths,
          new:           formValue.isNew,
          tabs:          allTabs,
          attributes: this.attributes
            .filter(a => a.name.trim() !== '')
            .map(a => ({
              name:   a.name,
              values: a.values
                .filter(v => v.value.trim() !== '')
                .map(v => ({ value: v.value, extraPrice: v.extraPrice }))
            }))
        };

        return this.productService.createProduct(productData);
      })
    ).subscribe({
      next: (created) => {
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

  onCancel(): void {
    this.router.navigate(['/boutique']);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private validateFile(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Le fichier doit être une image.';
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = "L'image ne doit pas dépasser 5 Mo.";
      return false;
    }
    return true;
  }

  private readPreview(file: File, callback: (result: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  getVariantCount(): number {
    if (this.attributes.length === 0) return 0;
    return this.attributes.reduce((total, attr) => {
      const validValues = attr.values.filter(v => v.value.trim() !== '').length;
      return total * (validValues || 1);
    }, 1);
  }

  getPreviewVariants(): { label: string; extraPrice: number }[] {
    if (this.attributes.length === 0) return [];
    const validAttrs = this.attributes
      .filter(a => a.name.trim() !== '')
      .map(a => a.values.filter(v => v.value.trim() !== ''));
    if (validAttrs.length === 0) return [];

    let combinations: { value: string; extraPrice: number }[][] = [[]];
    for (const values of validAttrs) {
      const newCombinations: { value: string; extraPrice: number }[][] = [];
      for (const existing of combinations) {
        for (const val of values) {
          newCombinations.push([...existing, val]);
        }
      }
      combinations = newCombinations;
    }
    return combinations.map(combo => ({
      label:      combo.map(v => v.value).join(' - '),
      extraPrice: combo.reduce((sum, v) => sum + (v.extraPrice || 0), 0)
    }));
  }
}
