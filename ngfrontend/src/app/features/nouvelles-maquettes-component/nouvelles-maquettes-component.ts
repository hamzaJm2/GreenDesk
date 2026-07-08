import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CouleurDetecteeDTO, MockupProjectDTO, MockupProjectRequestDTO, ProductColorisDTO } from '../../models/mockup';
import { Product } from '../../models/product';
import { environment } from '../../environments/environment';
import { MockupService } from '../../services/mockup-service';
import { ProductService } from '../../services/product-service';
import { PlacementState } from '../../models/placement';
import {
  PreviewLogo,
  PreviewMarkingZone,
  PreviewSnapshot,
  ProductLogoPreviewComponent
} from '../product-logo-preview/product-logo-preview';
import { ColorDetectionService } from '../../services/color-detection-service';
import { PdfGenerationProgress, PdfGenerationService } from '../../services/pdf-generation-service';

export interface ZoneElement {
  elementId: string;
  logoId: number | null;
  placement: PlacementState;
  touched: boolean;
  label: string;
}

interface HistoryEntry {
  elementId: string;
  zoneId: number;
  logoId: number | null;
  placement: PlacementState;
}

export interface ZonePlacement {
  zoneId: number;
  zoneNom: string;
  elements: ZoneElement[];
  activeElementId: string | null;
  touched: boolean;
}

export interface ColorisVariant {
  variantId: string;
  label: string;
  zonePlacements: ZonePlacement[];
  activeZoneId: number | null;
}

export interface ColorisCustomization {
  colorisId: number;
  colorisNom: string;
  colorisImageProduit: string;
  colorisCodeHex: string | null;
  colorisMaskPath?: string;
  imageBaseBlanc?: string;
  couleurPersonnalisable: boolean;
  variants: ColorisVariant[];
  activeVariantId: string;
  selectedColor?: string;
}

export interface ProductCustomization {
  productId: number;
  productName: string;
  colorisCustomizations: ColorisCustomization[];
  activeColorisId: number | null;
  validated: boolean;
}

@Component({
  selector: 'app-nouvelle-maquette',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductLogoPreviewComponent],
  templateUrl: './nouvelles-maquettes-component.html',
  styleUrls: ['./nouvelles-maquettes-component.scss']
})
export class NouvellesMaquettesComponent implements OnInit, OnDestroy {

  currentStep = 1;
  steps = [
    { id: 1, label: 'Logos' },
    { id: 2, label: 'Produits' },
    { id: 3, label: 'Personnalisation' },
    { id: 4, label: 'Génération' }
  ];

  project: MockupProjectDTO | null = null;
  projectId: number | null = null;
  nomProjet = 'Nouvelle maquette';

  allProducts: Product[] = [];

  // Étape 2
  colorisByProduct: Record<number, ProductColorisDTO[]> = {};
  expandedProducts: Record<number, boolean> = {};
  selectedColoris: Record<number, number[]> = {};

  // Étape 3
  customizations: ProductCustomization[] = [];
  activeProductId: number | null = null;

  // Zones de marquage
  markingZonesByProduct: Record<number, any[]> = {};

  uploadingLogo = false;
  logoError = '';
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  uploadsUrl = environment.uploadsUrl;

  // Couleurs
  projectColors: CouleurDetecteeDTO[] = [];
  isDetectingColors = false;
  editingColorId: string | null = null;
  editingColorHex = '#000000';
  editingColorNom = '';

  recoloredImageUrl: string | null = null;
  isRecoloring = false;
  editingVariantId: string | null = null;
  editingElementId: string | null = null;

  isGeneratingPdf = false;
  pdfProgress: PdfGenerationProgress = { current: 0, total: 0, message: '' };
  showGreenDeskLogo = true;
  desiredLogoWidthMm: number | null = null;
  previewForceShowBorder = false;
  private autoSaveTimer: any = null;
  currentMarkingZone: PreviewMarkingZone | null = null;

  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private readonly MAX_HISTORY = 20;
  private readonly boundKeyDown = (e: KeyboardEvent) => this.onKeyDown(e);


  constructor(
    private mockupService: MockupService,
    private productService: ProductService,
    private colorDetectionService: ColorDetectionService,
    private pdfGenerationService: PdfGenerationService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.boundKeyDown);
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
  }

  ngOnInit(): void {
    document.addEventListener('keydown', this.boundKeyDown);
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.cdr.detectChanges();
      }
    });

    const id = this.route.snapshot.queryParams['projectId'];
    if (id) {
      this.projectId = +id;
      this.mockupService.getById(this.projectId).subscribe({
        next: (project) => {
          this.project = project;
          this.nomProjet = project.nomProjet;
          this.isLoading = false;
          this.loadProjectColors();
          this.cdr.detectChanges();
        },
        error: () => this.createNewProject()
      });
    } else {
      this.createNewProject();
    }
  }

  createNewProject(): void {
    const dto: MockupProjectRequestDTO = {
      nomProjet: this.nomProjet,
      produitsSelectionnes: [],
      colorisSelectionnes: []
    };
    this.mockupService.create(dto).subscribe({
      next: (project) => {
        this.project = project;
        this.projectId = project.id!;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de créer le projet.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Navigation ───────────────────────────────────────────────
  goToStep(step: number): void {
    if (step < this.currentStep) this.currentStep = step;
  }

  nextStep(): void {
    if (this.canGoNext() && this.currentStep < 4) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  canGoNext(): boolean {
    if (this.currentStep === 1) return (this.project?.logos?.length ?? 0) > 0;
    if (this.currentStep === 2) return this.getTotalSelectedColoris() > 0;
    if (this.currentStep === 3) return this.customizations.every(c => c.validated);
    return true;
  }

  // ── Logos ────────────────────────────────────────────────────
  onLogoFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || !this.projectId) return;
    const fileArray = Array.from(files);
    let completed = 0;
    fileArray.forEach(file => {
      this.uploadingLogo = true;
      this.mockupService.uploadLogo(this.projectId!, file).subscribe({
        next: () => {
          completed++;
          if (completed === fileArray.length) {
            this.uploadingLogo = false;
            this.mockupService.getById(this.projectId!).subscribe({
              next: async (p) => {
                this.project = p;
                this.loadProjectColors();
                const newLogos = p.logos.slice(-fileArray.length).filter((l: any) => l.typeApercu === 'image');
                for (const logo of newLogos) {
                  await this.detectColorsFromLogo(logo);
                }
                this.cdr.detectChanges();
              }
            });
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.logoError = "Erreur lors de l'upload.";
          this.uploadingLogo = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  deleteLogo(logoId: number): void {
    if (!this.projectId) return;
    this.mockupService.deleteLogo(this.projectId, logoId).subscribe({
      next: () => this.refreshProject()
    });
  }
  autoSave(): void {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.saveDraft();
    }, 1500); // debounce 1.5s
  }
  setPrincipalLogo(logoId: number): void {
    if (!this.projectId) return;
    this.mockupService.update(this.projectId, {
      nomProjet: this.nomProjet,
      produitsSelectionnes: [],
      colorisSelectionnes: [],
      logoPrincipalId: String(logoId)
    }).subscribe({ next: (p) => { this.project = p; this.cdr.detectChanges(); } });
  }

  isPrincipalLogo(logoId: number): boolean {
    return String(logoId) === this.project?.logoPrincipalId;
  }

  getLogoUrl(path: string): string {
    return `${environment.apiUrl}/${path}`;
  }

  getFullImageUrl(path: string): string {
    return `${environment.apiUrl}/${path}`;
  }

  // ── Couleurs ─────────────────────────────────────────────────
  loadProjectColors(): void {
    const raw = this.project?.couleurs as any;
    if (!raw) { this.projectColors = []; return; }
    try {
      if (typeof raw === 'string') this.projectColors = JSON.parse(raw);
      else if (Array.isArray(raw)) this.projectColors = raw;
      else this.projectColors = [];
    } catch { this.projectColors = []; }
  }

  async detectColorsFromLogo(specificLogo?: any): Promise<void> {
    const logoToAnalyze = specificLogo ??
      this.project?.logos?.find(l => String(l.id) === this.project?.logoPrincipalId) ??
      this.project?.logos?.[0];
    if (!logoToAnalyze || logoToAnalyze.typeApercu !== 'image') return;
    this.isDetectingColors = true;
    this.cdr.detectChanges();
    try {
      const url = this.getLogoUrl(logoToAnalyze.publicPath);
      const detected = await this.colorDetectionService.detectColorsFromUrl(url, 5);
      const newDetected: CouleurDetecteeDTO[] = detected.map((c, i) => ({
        id: Date.now() + i,
        nom: c.nom,
        codeHex: c.hex,
        source: 'detected' as const
      }));
      const existingHexes = new Set(this.projectColors.map(c => c.codeHex.toUpperCase()));
      const toAdd = newDetected.filter(c => !existingHexes.has(c.codeHex.toUpperCase()));
      this.projectColors = [...this.projectColors, ...toAdd].slice(0, 10);
      this.saveColors();
    } finally {
      this.isDetectingColors = false;
      this.cdr.detectChanges();
    }
  }

  saveColors(): void {
    if (!this.projectId) return;
    this.mockupService.update(this.projectId, {
      nomProjet: this.nomProjet,
      produitsSelectionnes: Object.keys(this.selectedColoris).map(Number),
      colorisSelectionnes: Object.values(this.selectedColoris).flat(),
      couleurs: JSON.stringify(this.projectColors)
    }).subscribe({
      next: (p) => { this.project = p; this.loadProjectColors(); this.cdr.detectChanges(); }
    });
  }

  saveDraft(): void {
    if (!this.projectId) return;
    this.isSaving = true;
    const selectedColorsMap: Record<number, string> = {};
    this.customizations.forEach(c =>
      c.colorisCustomizations.forEach(cc => {
        if (cc.selectedColor) selectedColorsMap[cc.colorisId] = cc.selectedColor;
      })
    );
    this.mockupService.update(this.projectId, {
      nomProjet: this.nomProjet,
      produitsSelectionnes: Object.keys(this.selectedColoris).map(Number),
      colorisSelectionnes: Object.values(this.selectedColoris).flat(),
      couleurs: JSON.stringify(this.projectColors),
      brouillonMaquette: Object.keys(selectedColorsMap).length
        ? JSON.stringify(selectedColorsMap)
        : undefined
    }).subscribe({
      next: (p) => { this.project = p; this.isSaving = false; this.cdr.detectChanges(); },
      error: () => { this.isSaving = false; this.cdr.detectChanges(); }
    });
  }

  addColor(): void {
    if (this.projectColors.length >= 10) return;
    this.projectColors.push({ id: Date.now(), nom: `Couleur ${this.projectColors.length + 1}`, codeHex: '#000000', source: 'manual' });
    this.cdr.detectChanges();
  }

  removeColor(id: number): void {
    this.projectColors = this.projectColors.filter(c => c.id !== id);
    this.saveColors();
    this.cdr.detectChanges();
  }

  startEditColor(color: CouleurDetecteeDTO): void {
    this.editingColorId = String(color.id);
    this.editingColorHex = color.codeHex;
    this.editingColorNom = color.nom;
    this.cdr.detectChanges();
  }

  saveEditColor(color: CouleurDetecteeDTO): void {
    color.codeHex = this.editingColorHex;
    color.nom = this.editingColorNom;
    color.source = 'manual';
    this.editingColorId = null;
    this.saveColors();
    this.cdr.detectChanges();
  }

  cancelEditColor(): void {
    this.editingColorId = null;
    this.cdr.detectChanges();
  }

  // ── Étape 2 ───────────────────────────────────────────────────
  toggleProductAccordion(productId: number): void {
    this.expandedProducts[productId] = !this.expandedProducts[productId];
    if (this.expandedProducts[productId] && !this.colorisByProduct[productId]) {
      this.loadColoris(productId);
    }
  }

  loadColoris(productId: number): void {
    this.mockupService.getColorisByProduct(productId).subscribe({
      next: (coloris) => { this.colorisByProduct[productId] = coloris; this.cdr.detectChanges(); }
    });
  }

  toggleColoris(productId: number, colorisId: number): void {
    if (!this.selectedColoris[productId]) this.selectedColoris[productId] = [];
    const index = this.selectedColoris[productId].indexOf(colorisId);
    if (index === -1) this.selectedColoris[productId].push(colorisId);
    else this.selectedColoris[productId].splice(index, 1);
    if (this.selectedColoris[productId].length === 0) delete this.selectedColoris[productId];
  }

  isColorisSelected(productId: number, colorisId: number): boolean {
    return this.selectedColoris[productId]?.includes(colorisId) ?? false;
  }

  getSelectedColorisCount(productId: number): number {
    return this.selectedColoris[productId]?.length ?? 0;
  }

  getTotalSelectedColoris(): number {
    return Object.values(this.selectedColoris).reduce((sum, ids) => sum + ids.length, 0);
  }

  getTotalSelectedProducts(): number {
    return Object.keys(this.selectedColoris).length;
  }

  selectAllProducts(): void {
    this.allProducts.forEach(product => {
      if (!this.colorisByProduct[product.id]) this.loadColoris(product.id);
    });
    setTimeout(() => {
      this.allProducts.forEach(product => {
        const coloris = this.colorisByProduct[product.id] ?? [];
        if (coloris.length > 0) this.selectedColoris[product.id] = coloris.map(c => c.id);
      });
      this.cdr.detectChanges();
    }, 600);
  }

  resetProducts(): void {
    this.selectedColoris = {};
    this.cdr.detectChanges();
  }

  validateSelection(): void {
    this.buildCustomizations();
    this.currentStep = 3;
  }

  private buildCustomizations(): void {
    // Preserve selectedColor before rebuild (in-memory + backend draft)
    const savedColors = new Map<number, string>();
    this.customizations.forEach(c =>
      c.colorisCustomizations.forEach(cc => {
        if (cc.selectedColor) savedColors.set(cc.colorisId, cc.selectedColor);
      })
    );
    try {
      const draft = this.project?.brouillonMaquette
        ? JSON.parse(this.project.brouillonMaquette)
        : {};
      Object.entries(draft).forEach(([id, hex]) => {
        const numId = +id;
        if (!savedColors.has(numId)) savedColors.set(numId, hex as string);
      });
    } catch {}

    const principalLogoId = this.project?.logos?.[0]?.id ?? null;

    this.customizations = Object.entries(this.selectedColoris).map(([productIdStr, colorisIds]) => {
      const productId = +productIdStr;
      const product = this.allProducts.find(p => p.id === productId);
      const allColoris = this.colorisByProduct[productId] ?? [];
      const selectedColorisObjects = allColoris.filter(c => colorisIds.includes(c.id));

      // Use already-loaded zones if available; otherwise loadMarkingZones will init them async
      this.loadMarkingZones(productId);
      const zones = this.markingZonesByProduct[productId] ?? [];
      const firstZone = zones[0] ?? null;

      const colorisCustomizations: ColorisCustomization[] = selectedColorisObjects.map(coloris => {
        const variantId = `v-${coloris.id}-1`;
        const variant: ColorisVariant = {
          variantId,
          label: 'Variante 1',
          zonePlacements: firstZone ? [{
            zoneId: firstZone.id,
            zoneNom: firstZone.nom,
            elements: [{ elementId: 'el-1', logoId: principalLogoId, placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 }, touched: false, label: 'Élément 1' }],
            activeElementId: 'el-1',
            touched: false
          }] : [],
          activeZoneId: firstZone?.id ?? null
        };
        return {
          colorisId: coloris.id,
          colorisNom: coloris.nom,
          colorisImageProduit: coloris.imageProduit,
          colorisCodeHex: coloris.codeHex,
          colorisMaskPath: coloris.couleurMasquePng,
          imageBaseBlanc: coloris.imageBaseBlanc,
          couleurPersonnalisable: coloris.couleurPersonnalisable ?? false,
          activeVariantId: variantId,
          variants: [variant]
        };
      });

      return {
        productId,
        productName: product?.name ?? '',
        colorisCustomizations,
        activeColorisId: colorisCustomizations[0]?.colorisId ?? null,
        validated: false
      };
    });

    this.activeProductId = this.customizations[0]?.productId ?? null;

    // Restore selected custom colors
    if (savedColors.size > 0) {
      this.customizations.forEach(c =>
        c.colorisCustomizations.forEach(cc => {
          const hex = savedColors.get(cc.colorisId);
          if (hex) cc.selectedColor = hex;
        })
      );
    }
  }

  private loadMarkingZones(productId: number): void {
    if (this.markingZonesByProduct[productId]) return;
    this.productService.getProductById(productId).subscribe({
      next: (p) => {
        this.markingZonesByProduct[productId] = p.markingZones ?? [];
        const firstZone = this.markingZonesByProduct[productId][0];
        if (firstZone) {
          const principalLogoId = this.project?.logos?.[0]?.id ?? null;
          this.customizations.find(c => c.productId === productId)
            ?.colorisCustomizations.forEach(cc =>
              cc.variants.forEach(v => {
                if (v.zonePlacements.length === 0) {
                  v.zonePlacements = [{
                    zoneId: firstZone.id,
                    zoneNom: firstZone.nom,
                    elements: [{ elementId: 'el-1', logoId: principalLogoId, placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 }, touched: false, label: 'Élément 1' }],
                    activeElementId: 'el-1',
                    touched: false
                  }];
                  v.activeZoneId = firstZone.id;
                }
              })
            );
        }
        this.cdr.detectChanges();
      }
    });
  }

  private updateCurrentMarkingZone(): void {
    const zp = this.activeZonePlacement;
    if (!zp || !this.activeProductId) {
      this.currentMarkingZone = null;
      return;
    }
    const zone = (this.markingZonesByProduct[this.activeProductId] ?? []).find(z => z.id === zp.zoneId);
    if (!zone?.masquePng) {
      this.currentMarkingZone = null;
      return;
    }
    this.currentMarkingZone = {
      id: zone.id,
      nom: zone.nom,
      masquePng: zone.masquePng,
      paddingPercent: zone.paddingPercent ?? 5,
      largeurZoneMm: zone.largeurZoneMm ?? undefined,
      hauteurZoneMm: zone.hauteurZoneMm ?? undefined
    };
  }

  getVariantsCount(c: ProductCustomization): number {
    return c.colorisCustomizations.reduce((sum, cc) => sum + cc.variants.length, 0);
  }

  // ── PDF ───────────────────────────────────────────────────────
  async generatePdf(): Promise<void> {
    if (!this.project) return;
    this.isGeneratingPdf = true;
    this.pdfProgress = { current: 0, total: 0, message: 'Initialisation...' };
    this.cdr.detectChanges();
    try {
      await this.pdfGenerationService.generateMaquettePdf(
        this.project,
        this.customizations,
        this.allProducts,
        this.showGreenDeskLogo,
        (progress: any) => { this.pdfProgress = progress; this.cdr.detectChanges(); }
      );
    } finally {
      this.isGeneratingPdf = false;
      this.cdr.detectChanges();
    }
  }

  get pdfProgressPercent(): number {
    if (this.pdfProgress.total === 0) return 0;
    return Math.round((this.pdfProgress.current / this.pdfProgress.total) * 100);
  }

  // ── Étape 3 — Getters ─────────────────────────────────────────
  get activeCustomization(): ProductCustomization | null {
    return this.customizations.find(c => c.productId === this.activeProductId) ?? null;
  }

  get activeProduct(): Product | null {
    return this.allProducts.find(p => p.id === this.activeProductId) ?? null;
  }

  get activeColorisCustomization(): ColorisCustomization | null {
    const c = this.activeCustomization;
    if (!c) return null;
    return c.colorisCustomizations.find(cc => cc.colorisId === c.activeColorisId) ?? c.colorisCustomizations[0] ?? null;
  }

  get activeVariant(): ColorisVariant | null {
    const cc = this.activeColorisCustomization;
    if (!cc) return null;
    return cc.variants.find(v => v.variantId === cc.activeVariantId) ?? cc.variants[0] ?? null;
  }

  get activeZonePlacement(): ZonePlacement | null {
    const v = this.activeVariant;
    if (!v || v.activeZoneId === null) return null;
    return v.zonePlacements.find(zp => zp.zoneId === v.activeZoneId) ?? null;
  }

  get activeMarkingZone(): PreviewMarkingZone | null {
    const zp = this.activeZonePlacement;
    if (!zp || !this.activeProductId) return null;
    const zone = (this.markingZonesByProduct[this.activeProductId] ?? []).find(z => z.id === zp.zoneId);
    if (!zone?.masquePng) return null;
    return {
      id: zone.id,
      nom: zone.nom,
      masquePng: zone.masquePng,
      paddingPercent: zone.paddingPercent ?? 5,
      largeurZoneMm: zone.largeurZoneMm ?? undefined,
      hauteurZoneMm: zone.hauteurZoneMm ?? undefined
    };
  }

  isZoneActive(zoneId: number): boolean {
    return this.activeVariant?.zonePlacements.some(zp => zp.zoneId === zoneId) ?? false;
  }
  get activeProductMarkingZones(): any[] {
    return this.markingZonesByProduct[this.activeProductId ?? -1] ?? [];
  }

  get previewLogos(): PreviewLogo[] {
    return (this.project?.logos ?? [])
      .filter(l => l.typeApercu === 'image')
      .map(l => ({
        id: l.id!,
        nomOriginal: l.nomOriginal,
        publicPath: l.publicPath,
        typeApercu: l.typeApercu
      }));
  }

  get activeElement(): ZoneElement | null {
    const zp = this.activeZonePlacement;
    if (!zp) return null;
    return zp.elements.find(el => el.elementId === zp.activeElementId) ?? zp.elements[0] ?? null;
  }

  get activeInitialSnapshot(): { logoId: number | null; placement?: PlacementState } | null {
    const el = this.activeElement;
    if (!el) return null;
    return { logoId: el.logoId, placement: el.touched ? el.placement : undefined };
  }

  get backgroundPreviewElements(): { elementId: string; logoId: number; xPercent: number; yPercent: number; scalePercent: number; rotationDeg: number }[] {
    const zp = this.activeZonePlacement;
    if (!zp) return [];
    return zp.elements
      .filter(el => el.elementId !== zp.activeElementId && el.logoId !== null)
      .map(el => ({
        elementId: el.elementId,
        logoId: el.logoId as number,
        xPercent: el.placement.xPercent,
        yPercent: el.placement.yPercent,
        scalePercent: el.placement.scalePercent,
        rotationDeg: el.placement.rotationDeg
      }));
  }

  get activeProductImagePath(): string | null {
    if (this.recoloredImageUrl) return this.recoloredImageUrl;
    const cc = this.activeColorisCustomization;
    return cc?.colorisImageProduit ?? this.activeProduct?.image ?? null;
  }

  // ── Étape 3 — Actions ─────────────────────────────────────────
  setActiveZone(zoneId: number): void {
    const v = this.activeVariant;
    if (!v) return;
    v.activeZoneId = zoneId;
    this.updateCurrentMarkingZone();
    this.cdr.detectChanges();
  }

  addZoneToVariant(zone: any): void {
    const v = this.activeVariant;
    if (!v) return;
    if (v.zonePlacements.find(zp => zp.zoneId === zone.id)) return;
    const defaultLogoId = v.zonePlacements[0]?.elements[0]?.logoId ?? null;
    v.zonePlacements.push({
      zoneId: zone.id,
      zoneNom: zone.nom,
      elements: [{ elementId: 'el-1', logoId: defaultLogoId, placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 }, touched: false, label: 'Élément 1' }],
      activeElementId: 'el-1',
      touched: false
    });
    v.activeZoneId = zone.id;
    this.cdr.detectChanges();
    this.autoSave();
  }

  removeZoneFromVariant(zoneId: number): void {
    const v = this.activeVariant;
    if (!v || v.zonePlacements.length <= 1) return;
    v.zonePlacements = v.zonePlacements.filter(zp => zp.zoneId !== zoneId);
    if (v.activeZoneId === zoneId) {
      v.activeZoneId = v.zonePlacements[0]?.zoneId ?? null;
    }
    this.cdr.detectChanges();
    this.autoSave();
  }

  setActiveVariant(variantId: string): void {
    const cc = this.activeColorisCustomization;
    if (cc) { cc.activeVariantId = variantId; this.clearHistory(); this.cdr.detectChanges(); }
  }

  startEditVariant(variantId: string, event: Event): void {
    event.stopPropagation();
    this.editingVariantId = variantId;
    this.cdr.detectChanges();
  }

  saveVariantLabel(event: Event, v: ColorisVariant): void {
    const val = (event.target as HTMLInputElement).value.trim();
    if (val) v.label = val;
    this.editingVariantId = null;
    this.cdr.detectChanges();
    this.autoSave();
  }

  startEditElement(elementId: string, event: Event): void {
    event.stopPropagation();
    this.editingElementId = elementId;
    this.cdr.detectChanges();
  }

  saveElementLabel(event: Event, el: ZoneElement): void {
    const val = (event.target as HTMLInputElement).value.trim();
    if (val) el.label = val;
    this.editingElementId = null;
    this.cdr.detectChanges();
    this.autoSave();
  }

  addVariant(): void {
    const cc = this.activeColorisCustomization;
    if (!cc) return;
    const newId = `v-${cc.colorisId}-${cc.variants.length + 1}`;
    const firstZone = this.activeProductId ? (this.markingZonesByProduct[this.activeProductId] ?? [])[0] : null;
    const principalLogoId = this.project?.logos?.find(l => String(l.id) === this.project?.logoPrincipalId)?.id
      ?? this.project?.logos?.[0]?.id
      ?? null;
    cc.variants.push({
      variantId: newId,
      label: `Variante ${cc.variants.length + 1}`,
      zonePlacements: firstZone ? [{
        zoneId: firstZone.id,
        zoneNom: firstZone.nom,
        elements: [{ elementId: 'el-1', logoId: principalLogoId, placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 }, touched: false, label: 'Élément 1' }],
        activeElementId: 'el-1',
        touched: false
      }] : [],
      activeZoneId: firstZone?.id ?? null
    });
    cc.activeVariantId = newId;
    this.cdr.detectChanges();
  }

  removeVariant(variantId: string): void {
    const cc = this.activeColorisCustomization;
    if (!cc || cc.variants.length <= 1) return;
    cc.variants = cc.variants.filter(v => v.variantId !== variantId);
    cc.activeVariantId = cc.variants[0].variantId;
    this.cdr.detectChanges();
  }

  selectLogo(logoId: number): void {
    const el = this.activeElement;
    if (!el) return;
    el.logoId = logoId;
    el.touched = true;
    const zp = this.activeZonePlacement;
    if (zp) zp.touched = true;
    this.cdr.detectChanges();
    this.autoSave();
    const logo = this.project?.logos?.find((l: any) => l.id === logoId);
    if (logo && logo.typeApercu === 'image') {
      this.refreshDetectedColors(logo);
    }
  }

  private async refreshDetectedColors(logo: any): Promise<void> {
    this.isDetectingColors = true;
    this.cdr.detectChanges();
    try {
      const url = this.getLogoUrl(logo.publicPath);
      const detected = await this.colorDetectionService.detectColorsFromUrl(url, 5);
      const newDetected: CouleurDetecteeDTO[] = detected.map((c, i) => ({
        id: Date.now() + i,
        nom: c.nom,
        codeHex: c.hex,
        source: 'detected' as const
      }));
      const manual = this.projectColors.filter(c => c.source === 'manual');
      this.projectColors = [...newDetected, ...manual].slice(0, 10);
      this.saveColors();
    } finally {
      this.isDetectingColors = false;
      this.cdr.detectChanges();
    }
  }

  onSnapshotChange(snapshot: PreviewSnapshot): void {
    const el = this.activeElement;
    if (!el) return;
    el.logoId = snapshot.logoId;
    el.placement = { xPercent: snapshot.xPercent, yPercent: snapshot.yPercent, scalePercent: snapshot.scalePercent, rotationDeg: snapshot.rotationDeg };
    el.touched = true;
    const zp = this.activeZonePlacement;
    if (zp) zp.touched = true;
    this.cdr.detectChanges();
    this.autoSave();
  }

  resetPlacement(): void {
    const el = this.activeElement;
    if (el) {
      el.placement = { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 };
      el.touched = false;
      this.cdr.detectChanges();
    }
  }

  getTotalVariants(): number {
    return this.customizations.reduce((sum, c) =>
      sum + c.colorisCustomizations.reduce((s, cc) => s + cc.variants.length, 0), 0);
  }

  refreshProject(): void {
    if (!this.projectId) return;
    this.mockupService.getById(this.projectId).subscribe({
      next: (p) => { this.project = p; this.loadProjectColors(); this.cdr.detectChanges(); }
    });
  }

  isEditingColor(colorId: number): boolean {
    return this.editingColorId === String(colorId);
  }

  get activeColorisPersonnalisable(): boolean {
    return this.activeColorisCustomization?.couleurPersonnalisable ?? false;
  }

  isColorPersonnalisee(colorisNom: string): boolean {
    const cc = this.activeColorisCustomization;
    return cc?.couleurPersonnalisable === true || colorisNom.toLowerCase().includes('personnalis');
  }

  getProjectColorsForProduct(): CouleurDetecteeDTO[] {
    return this.projectColors;
  }

  setActiveProduct(productId: number): void {
    this.activeProductId = productId;
    this.recoloredImageUrl = null;
    // Restore recolored image for the active coloris of the newly selected product.
    const c = this.customizations.find(c => c.productId === productId);
    if (c) {
      const cc = c.colorisCustomizations.find(cc => cc.colorisId === c.activeColorisId);
      if (cc?.selectedColor) this.setActiveColorPersonnalisee(cc.selectedColor);
    }
    this.cdr.detectChanges();
  }

  setActiveColoris(colorisId: number): void {
    const c = this.activeCustomization;
    if (c) {
      c.activeColorisId = colorisId;
      this.recoloredImageUrl = null;
      const cc = c.colorisCustomizations.find(cc => cc.colorisId === colorisId);
      if (cc?.selectedColor) this.setActiveColorPersonnalisee(cc.selectedColor);
      this.clearHistory();
      this.cdr.detectChanges();
    }
  }

  validateProduct(productId: number): void {
    const c = this.customizations.find(c => c.productId === productId);
    if (c) {
      c.validated = true;
      this.recoloredImageUrl = null;
      const currentIndex = this.customizations.indexOf(c);
      const next = this.customizations[currentIndex + 1];
      if (next) this.activeProductId = next.productId;
      this.clearHistory();
      this.cdr.detectChanges();
    }
  }

  reopenProduct(productId: number): void {
    const c = this.customizations.find(c => c.productId === productId);
    if (c) {
      c.validated = false;
      this.activeProductId = productId;
      this.recoloredImageUrl = null;
      this.clearHistory();
      this.cdr.detectChanges();
    }
  }

  async setActiveColorPersonnalisee(hex: string): Promise<void> {
    const cc = this.activeColorisCustomization;
    if (!cc) return;
    cc.selectedColor = hex;
    this.isRecoloring = true;
    this.cdr.detectChanges();
    const baseImage = (cc.couleurPersonnalisable && cc.imageBaseBlanc)
      ? cc.imageBaseBlanc
      : cc.colorisImageProduit;
    const imageUrl = this.getFullImageUrl(baseImage);
    const maskUrl = cc.colorisMaskPath ? this.getFullImageUrl(cc.colorisMaskPath) : undefined;
    const productName = this.activeCustomization?.productName?.toLowerCase() ?? '';
    const mode = productName.includes('moka') ? 'full' : 'keep-white';
    this.recoloredImageUrl = await this.colorDetectionService.recolorImage(imageUrl, hex, mode, maskUrl);
    this.isRecoloring = false;
    this.cdr.detectChanges();
    this.autoSave();
  }

  getLogoWidthMm(): number {
    const zone = this.activeMarkingZone;
    const el = this.activeElement;
    if (!zone?.largeurZoneMm || !el) return 0;
    return (el.placement.scalePercent / 100) * zone.largeurZoneMm;
  }

  getLogoHeightMm(): number {
    return this.getLogoWidthMm();
  }

  applyDesiredLogoWidth(): void {
    const zone = this.activeMarkingZone;
    const el = this.activeElement;
    if (!zone?.largeurZoneMm || !el || !this.desiredLogoWidthMm) return;
    const newScale = (this.desiredLogoWidthMm / zone.largeurZoneMm) * 100;
    el.placement = { ...el.placement, scalePercent: Math.min(Math.max(newScale, 5), 95) };
    el.touched = true;
    this.cdr.detectChanges();
    this.autoSave();
  }

  addElementToZone(): void {
    const zp = this.activeZonePlacement;
    if (!zp) return;
    const newId = `el-${zp.elements.length + 1}`;
    zp.elements.push({
      elementId: newId,
      logoId: zp.elements[0]?.logoId ?? null,
      placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 },
      touched: false,
      label: `Élément ${zp.elements.length + 1}`
    });
    zp.activeElementId = newId;
    this.cdr.detectChanges();
    this.autoSave();
  }

  removeElement(elementId: string): void {
    const zp = this.activeZonePlacement;
    if (!zp || zp.elements.length <= 1) return;
    zp.elements = zp.elements.filter(el => el.elementId !== elementId);
    if (zp.activeElementId === elementId) {
      zp.activeElementId = zp.elements[0]?.elementId ?? null;
    }
    this.cdr.detectChanges();
    this.autoSave();
  }

  onPreviewStageBgClicked(): void {
    this.previewForceShowBorder = false;
    this.cdr.detectChanges();
  }

  setActiveElement(elementId: string): void {
    const zp = this.activeZonePlacement;
    if (!zp) return;
    zp.activeElementId = elementId;
    this.previewForceShowBorder = true;
    this.cdr.detectChanges();
  }

  // ── Undo / Redo ──────────────────────────────────────────────

  onInteractionStart(): void {
    const el = this.activeElement;
    const zp = this.activeZonePlacement;
    if (!el || !zp) return;
    this.redoStack = [];
    if (this.undoStack.length >= this.MAX_HISTORY) this.undoStack.shift();
    this.undoStack.push({
      elementId: el.elementId,
      zoneId: zp.zoneId,
      logoId: el.logoId,
      placement: { ...el.placement }
    });
  }

  get canUndo(): boolean { return this.undoStack.length > 0; }
  get canRedo(): boolean { return this.redoStack.length > 0; }

  undo(): void {
    if (!this.undoStack.length) return;
    const el = this.activeElement;
    const zp = this.activeZonePlacement;
    if (!el || !zp) return;
    this.redoStack.push({ elementId: el.elementId, zoneId: zp.zoneId, logoId: el.logoId, placement: { ...el.placement } });
    this.applyHistoryEntry(this.undoStack.pop()!);
  }

  redo(): void {
    if (!this.redoStack.length) return;
    const el = this.activeElement;
    const zp = this.activeZonePlacement;
    if (!el || !zp) return;
    this.undoStack.push({ elementId: el.elementId, zoneId: zp.zoneId, logoId: el.logoId, placement: { ...el.placement } });
    this.applyHistoryEntry(this.redoStack.pop()!);
  }

  private applyHistoryEntry(entry: HistoryEntry): void {
    const zp = this.activeZonePlacement;
    if (!zp) return;
    const el = zp.elements.find(e => e.elementId === entry.elementId);
    if (!el) return;
    el.placement = { ...entry.placement };
    el.logoId = entry.logoId;
    el.touched = true;
    this.cdr.detectChanges();
  }

  clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (this.currentStep !== 3) return;
    const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const key = e.key.toLowerCase();
    if (e.ctrlKey && !e.shiftKey && key === 'z') {
      e.preventDefault();
      this.undo();
    } else if (e.ctrlKey && (key === 'y' || (e.shiftKey && key === 'z'))) {
      e.preventDefault();
      this.redo();
    }
  }
}
