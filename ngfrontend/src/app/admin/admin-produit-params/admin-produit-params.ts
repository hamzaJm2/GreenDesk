import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../services/product-service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-produit-params',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-produit-params.html',
  styleUrls: ['./admin-produit-params.scss']
})
export class AdminProduitParamsComponent implements OnInit {

  productId!: number;
  product: any = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  currentStep = 1;
  totalSteps = 4;

  // ── Étape 1 — Infos générales ────────────────────────────────────────────
  nom = '';
  shortDescription = '';
  longDescription = '';
  actif = true;
  labelType: 'FIF' | 'OFG' | 'NONE' = 'FIF';
  isNew = false;

  // ── Étape 2 — Coloris ────────────────────────────────────────────────────
  coloris: {
    id?: number;
    nom: string;
    codeHex: string;
    actif: boolean;
    displayOrder: number;
    imageProduit?: string;
    imageFile?: File;
    imagePreview?: string;
    couleurMasquePng?: string;
    colorMaskFile?: File;
    colorMaskPreview?: string;
    imageBaseBlanc?: string;
    baseBlanckFile?: File;
    baseBlanckPreview?: string;
    couleurPersonnalisable: boolean;
  }[] = [];

  // ── Étape 3 — Zones de marquage ──────────────────────────────────────────
  markingZones: {
    id?: number;
    nom: string;
    zoomActive: boolean;
    paddingPercent: number;
    masquePng?: string;
    masqueFile?: File;
    masquePreview?: string;
    displayOrder: number;
    largeurZoneMm?: number | null;
    hauteurZoneMm?: number | null;
  }[] = [];

  // ── Étape 4 — Points forts ───────────────────────────────────────────────
  strengthItems: {
    id?: number;
    titre: string;
    phrase: string;
    iconId: string;
    displayOrder: number;
  }[] = [];

  readonly LABEL_OPTIONS: { value: 'FIF' | 'OFG' | 'NONE'; label: string }[] = [
    { value: 'FIF', label: 'Fabriqué en France' },
    { value: 'OFG', label: 'Origine France Garantie' },
    { value: 'NONE', label: 'Aucun' }
  ];
  readonly STEPS = [
    { num: 1, label: 'Infos générales' },
    { num: 2, label: 'Coloris' },
    { num: 3, label: 'Zones de marquage' },
    { num: 4, label: 'Points forts' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct();
  }

  loadProduct(): void {
    this.isLoading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (p) => {
        this.product = p;
        this.hydrate(p);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le produit.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private hydrate(p: any): void {
    this.nom = p.name ?? '';
    this.shortDescription = p.shortDescription ?? '';
    this.longDescription = p.longDescription ?? '';
    this.actif = p.actif ?? true;
    this.labelType = p.labelType ?? 'FIF';
    this.isNew = p.new ?? false;

    this.coloris = (p.coloris ?? []).map((c: any) => ({
      id: c.id,
      nom: c.nom ?? '',
      codeHex: c.codeHex ?? '#000000',
      actif: c.actif ?? true,
      displayOrder: c.displayOrder ?? 0,
      imageProduit: c.imageProduit,
      couleurMasquePng: c.couleurMasquePng,
      imageBaseBlanc: c.imageBaseBlanc,
      couleurPersonnalisable: c.couleurPersonnalisable ?? false
    }));

    this.markingZones = (p.markingZones ?? []).map((z: any) => ({
      id: z.id,
      nom: z.nom ?? '',
      zoomActive: z.zoomActive ?? false,
      paddingPercent: z.paddingPercent ?? 5,
      masquePng: z.masquePng,
      displayOrder: z.displayOrder ?? 0,
      largeurZoneMm: z.largeurZoneMm ?? null,
      hauteurZoneMm: z.hauteurZoneMm ?? null
    }));

    this.strengthItems = (p.strengthItems ?? []).map((s: any) => ({
      id: s.id,
      titre: s.titre ?? '',
      phrase: s.phrase ?? '',
      iconId: s.iconId ?? '',
      displayOrder: s.displayOrder ?? 0
    }));
  }

  // ── Navigation étapes ────────────────────────────────────────────────────
  goToStep(step: number): void {
    this.currentStep = step;
    this.errorMessage = '';
    this.successMessage = '';
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  // ── Coloris ──────────────────────────────────────────────────────────────
  addColoris(): void {
    this.coloris.push({
      nom: '',
      codeHex: '#000000',
      actif: true,
      displayOrder: this.coloris.length,
      couleurPersonnalisable: false
    });
  }

  get hasCouleurPersonnalisable(): boolean {
    return this.coloris.some(c => c.couleurPersonnalisable);
  }

  addCouleurPersonnalisee(): void {
    this.coloris.push({
      nom: 'Couleur personnalisée',
      codeHex: '#000000',
      actif: true,
      displayOrder: this.coloris.length,
      couleurPersonnalisable: true
    });
  }

  removeColoris(index: number): void {
    this.coloris.splice(index, 1);
  }

  onColorisImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.coloris[index].imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coloris[index].imagePreview = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  onColorMaskSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.coloris[index].colorMaskFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coloris[index].colorMaskPreview = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  onBaseBlanckSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.coloris[index].baseBlanckFile = file;
    this.coloris[index].imageBaseBlanc = undefined;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coloris[index].baseBlanckPreview = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  selectBaseBlanck(index: number, path: string): void {
    this.coloris[index].imageBaseBlanc = path;
    this.coloris[index].baseBlanckFile = undefined;
    this.coloris[index].baseBlanckPreview = undefined;
  }

  getOtherColorisImages(currentIndex: number): { nom: string; path: string }[] {
    return this.coloris
      .filter((c, i) => i !== currentIndex && c.imageProduit)
      .map(c => ({ nom: c.nom || 'Sans nom', path: c.imageProduit! }));
  }

  // ── Zones de marquage ────────────────────────────────────────────────────
  addMarkingZone(): void {
    this.markingZones.push({
      nom: 'Recto',
      zoomActive: false,
      paddingPercent: 5,
      displayOrder: this.markingZones.length,
      largeurZoneMm: null,
      hauteurZoneMm: null
    });
  }

  removeMarkingZone(index: number): void {
    this.markingZones.splice(index, 1);
  }

  onMasqueSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.markingZones[index].masqueFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.markingZones[index].masquePreview = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  // ── Points forts ─────────────────────────────────────────────────────────
  addStrength(): void {
    this.strengthItems.push({
      titre: '',
      phrase: '',
      iconId: '',
      displayOrder: this.strengthItems.length
    });
  }

  removeStrength(index: number): void {
    this.strengthItems.splice(index, 1);
  }

  // ── Upload image coloris ─────────────────────────────────────────────────
  private async uploadColorisImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', this.nom);
    const res = await this.http.post<{ path: string }>(
      `${environment.apiUrl}/uploads/product/coloris`,
      formData
    ).toPromise();
    return res?.path ?? '';
  }

  // ── Upload masque couleur coloris ────────────────────────────────────────
  private async uploadColorMask(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', this.nom);
    const res = await this.http.post<{ path: string }>(
      `${environment.apiUrl}/uploads/product/coloris-mask`,
      formData
    ).toPromise();
    return res?.path ?? '';
  }

  private async uploadBaseBlanck(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', this.nom);
    const res = await this.http.post<{ path: string }>(
      `${environment.apiUrl}/uploads/product/coloris`,
      formData
    ).toPromise();
    return res?.path ?? '';
  }

  // ── Upload masque PNG ────────────────────────────────────────────────────
  private async uploadMasque(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', this.nom);
    const res = await this.http.post<{ path: string }>(
      `${environment.apiUrl}/uploads/product/masque`,
      formData
    ).toPromise();
    return res?.path ?? '';
  }

  // ── Sauvegarde ───────────────────────────────────────────────────────────
  async save(): Promise<void> {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Upload images coloris + masques couleur
      for (const c of this.coloris) {
        if (c.imageFile) {
          c.imageProduit = await this.uploadColorisImage(c.imageFile);
          c.imageFile = undefined;
        }
        if (c.colorMaskFile) {
          c.couleurMasquePng = await this.uploadColorMask(c.colorMaskFile);
          c.colorMaskFile = undefined;
        }
        if (c.baseBlanckFile) {
          c.imageBaseBlanc = await this.uploadBaseBlanck(c.baseBlanckFile);
          c.baseBlanckFile = undefined;
        }
      }

      // Upload masques PNG
      for (const z of this.markingZones) {
        if (z.masqueFile) {
          z.masquePng = await this.uploadMasque(z.masqueFile);
          z.masqueFile = undefined;
        }
      }

      const payload = {
        ...this.product,
        name: this.nom,
        shortDescription: this.shortDescription,
        longDescription: this.longDescription,
        actif: this.actif,
        labelType: this.labelType,
        new: this.isNew,
        coloris: this.coloris.map((c, i) => ({
          id: c.id,
          nom: c.nom,
          codeHex: c.codeHex,
          actif: c.actif,
          displayOrder: i,
          imageProduit: c.imageProduit,
          couleurMasquePng: c.couleurMasquePng,
          imageBaseBlanc: c.imageBaseBlanc,
          couleurPersonnalisable: c.couleurPersonnalisable
        })),
        markingZones: this.markingZones.map((z, i) => ({
          id: z.id,
          nom: z.nom,
          zoomActive: z.zoomActive,
          paddingPercent: z.paddingPercent,
          masquePng: z.masquePng,
          displayOrder: i,
          largeurZoneMm: z.largeurZoneMm ?? null,
          hauteurZoneMm: z.hauteurZoneMm ?? null
        })),
        strengthItems: this.strengthItems.map((s, i) => ({
          id: s.id,
          titre: s.titre,
          phrase: s.phrase,
          iconId: s.iconId,
          displayOrder: i
        }))
      };

      await (this.productService as any).updateProduct(this.productId, payload).toPromise();
      this.successMessage = 'Produit mis à jour avec succès !';
      this.loadProduct();
    } catch (err) {
      this.errorMessage = 'Une erreur est survenue lors de la sauvegarde.';
      console.error(err);
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl}/${path}`;
  }
}
