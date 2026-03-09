import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService} from '../../services/product-service';

export interface CreateProductData {
  name: string;
  category: 'box' | 'plastique' | 'electronique' | 'tissus';
  categoryName: string;
  price: number;
  deliveryPrice: number;
  description: string;
  features: string[];
  isNew: boolean;
  image: string;
  gallery: string[];
  achievements: string[];
}

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-create.html',
  styleUrls: ['./product-create.scss']
})


export class ProductCreateComponent {
  // Formulaire
  productForm: FormGroup;

  // Catégories disponibles
  categories = [
    { value: 'box', label: 'Box échantillons' },
    { value: 'plastique', label: 'Gamme plastique' },
    { value: 'electronique', label: 'Gamme électronique' },
    { value: 'tissus', label: 'Gamme tissus' }
  ];

  // Fichiers uploadés
  mainImageFile: File | null = null;
  mainImagePreview: string | null = null;

  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];

  achievementFiles: File[] = [];
  achievementPreviews: string[] = [];

  // États
  isSubmitting: boolean = false;
  currentStep: number = 1;
  totalSteps: number = 3;

  // Messages
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    // Initialisation du formulaire
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      categoryName: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      deliveryPrice: [null, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      features: this.fb.array([]),
      isNew: [true]
    });

    // Ajouter un feature par défaut
    this.addFeature();
  }

  // Getter pour le FormArray des features
  get features(): FormArray {
    return this.productForm.get('features') as FormArray;
  }

  // Ajouter un point fort
  addFeature(): void {
    this.features.push(this.fb.control('', Validators.required));
  }

  // Supprimer un point fort
  removeFeature(index: number): void {
    this.features.removeAt(index);
  }

  // Mettre à jour categoryName quand category change
  onCategoryChange(event: any): void {
    const selectedCategory = this.categories.find(c => c.value === event.target.value);
    if (selectedCategory) {
      this.productForm.patchValue({ categoryName: selectedCategory.label });
    }
  }

  // Gestion image principale
  onMainImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Le fichier doit être une image.';
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'L\'image ne doit pas dépasser 5 Mo.';
        return;
      }

      this.mainImageFile = file;
      this.errorMessage = '';

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.mainImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Supprimer l'image principale
  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = null;
  }

  // Gestion galerie
  onGallerySelected(event: any): void {
    const files = Array.from(event.target.files) as File[];

    // Vérifier chaque fichier
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Tous les fichiers doivent être des images.';
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Chaque image ne doit pas dépasser 5 Mo.';
        return false;
      }
      return true;
    });

    this.galleryFiles = [...this.galleryFiles, ...validFiles];

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.galleryPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // Supprimer une image de la galerie
  removeGalleryImage(index: number): void {
    this.galleryFiles.splice(index, 1);
    this.galleryPreviews.splice(index, 1);
  }

  // Gestion réalisations
  onAchievementsSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];

    // Vérifier chaque fichier
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Tous les fichiers doivent être des images.';
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Chaque image ne doit pas dépasser 5 Mo.';
        return false;
      }
      return true;
    });

    this.achievementFiles = [...this.achievementFiles, ...validFiles];

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.achievementPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // Supprimer une image des réalisations
  removeAchievementImage(index: number): void {
    this.achievementFiles.splice(index, 1);
    this.achievementPreviews.splice(index, 1);
  }

  // Navigation - étape suivante
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.currentStep === 1) {
        // Marquer tous les champs comme touchés pour afficher les erreurs
        Object.keys(this.productForm.controls).forEach(key => {
          const control = this.productForm.get(key);
          control?.markAsTouched();
        });

        if (this.productForm.valid) {
          this.currentStep++;
        } else {
          this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
        }
      } else if (this.currentStep === 2) {
        if (this.mainImageFile) {
          this.currentStep++;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'L\'image principale est obligatoire.';
        }
      }
    }
  }

  // Navigation - étape précédente
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  // Soumission du formulaire
  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (!this.mainImageFile) {
      this.errorMessage = 'L\'image principale est obligatoire.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      console.log('📤 Début de la création du produit...');

      // 1. Upload image principale
      console.log('📸 Upload image principale...');




      // 2. Upload galerie
      let galleryPaths: string[] = [];
      if (this.galleryFiles.length > 0) {
        console.log('🖼️ Upload galerie...');


        console.log('✅ Galerie uploadée:', galleryPaths);
      }

      // 3. Upload réalisations
      let achievementPaths: string[] = [];
      if (this.achievementFiles.length > 0) {
        console.log('🏆 Upload réalisations...');


        console.log('✅ Réalisations uploadées:', achievementPaths);
      }

      // 4. Préparer les données du produit
      const formValue = this.productForm.value;
      const productData: CreateProductData = {
        name: formValue.name,
        category: formValue.category,
        categoryName: formValue.categoryName,
        price: formValue.price,
        deliveryPrice: formValue.deliveryPrice,
        description: formValue.description,
        features: formValue.features.filter((f: string) => f && f.trim() !== ''),
        isNew: formValue.isNew,
        image: "",
        gallery: galleryPaths,
        achievements: achievementPaths
      };

      console.log('📦 Création du produit avec données:', productData);



      console.log('✅ Produit créé avec succès:')
      this.successMessage = 'Produit créé avec succès !'


    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      this.errorMessage = 'Une erreur est survenue lors de la création du produit.';
    } finally {
      this.isSubmitting = false;
    }
  }

  // Annuler la création
  onCancel(): void {
    this.router.navigate(['/boutique']);
  }
}
