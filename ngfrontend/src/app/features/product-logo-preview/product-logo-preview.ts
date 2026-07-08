import {
  Component, Input, Output, EventEmitter,
  OnInit, OnChanges, OnDestroy, ChangeDetectorRef, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductMockupRenderComponent } from '../product-mockup-render/product-mockup-render';
import {MaskBounds, PlacementState, StageSize} from '../../models/placement';
import {environment} from '../../environments/environment';


export interface PreviewLogo {
  id: number;
  nomOriginal: string;
  publicPath: string;
  typeApercu: string;
}

export interface PreviewMarkingZone {
  id: number;
  nom: string;
  masquePng: string;
  paddingPercent?: number;
  largeurZoneMm?: number;
  hauteurZoneMm?: number;
}

export interface PreviewSnapshot {
  logoId: number | null;
  logoName: string;
  logoImagePath: string;
  logoType: string;
  xPercent: number;
  yPercent: number;
  scalePercent: number;
  rotationDeg: number;
}

@Component({
  selector: 'app-product-logo-preview',
  standalone: true,
  imports: [CommonModule, ProductMockupRenderComponent],
  templateUrl: './product-logo-preview.html',
  styleUrls: ['./product-logo-preview.scss']
})
export class ProductLogoPreviewComponent implements OnInit, OnChanges, OnDestroy {

  @Input() productUnavailableReason: string | null = null;
  @Input() productImagePath: string | null = null;
  @Input() markingZone: PreviewMarkingZone | null = null;
  @Input() logos: PreviewLogo[] = [];
  @Input() defaultLogoId: number | null = null;
  @Input() initialSnapshot: { logoId: number | null; placement?: PlacementState } | null = null;
  @Input() backgroundElements: { elementId: string; logoId: number; xPercent: number; yPercent: number; scalePercent: number; rotationDeg: number }[] = [];
  @Input() forceShowBorder: boolean = false;

  @Output() snapshotChange = new EventEmitter<PreviewSnapshot>();
  @Output() stageReady = new EventEmitter<HTMLElement>();
  @Output() stageBgClicked = new EventEmitter<void>();
  @Output() backgroundElementSelected = new EventEmitter<string>();
  @Output() interactionStart = new EventEmitter<void>();
  @Output() interactionEnd = new EventEmitter<void>();

  xPercent = 50;
  yPercent = 50;
  scalePercent = 25;
  rotationDeg = 0;
  selectedLogoId: number | null = null;
  zoomLevel = 100;
  panX = 0;
  panY = 0;
  isPanning = false;
  private panStartMouseX = 0;
  private panStartMouseY = 0;
  private panStartX = 0;
  private panStartY = 0;
  private panContainer: HTMLElement | null = null;
  private readonly boundMouseMove = (e: MouseEvent) => this.onDocumentMouseMove(e);
  private readonly boundMouseUp   = (e: MouseEvent) => this.onDocumentMouseUp(e);
  stageSize: StageSize | null = null;
  didInitFromMask = false;
  unavailableReason: string | null = null;
  maskBoundsPercent: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number } | null = null;

  private resizeObserver: ResizeObserver | null = null;
  private stageElement: HTMLElement | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initPlacement();
    this.computeUnavailableReason();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSnapshot'] || changes['markingZone'] || changes['logos'] || changes['defaultLogoId']) {
      this.initPlacement();

      if (changes['markingZone']) {
        const prevMask = changes['markingZone'].previousValue?.masquePng;
        const currMask = changes['markingZone'].currentValue?.masquePng;
        if (prevMask !== currMask) {
          // Only null maskBoundsPercent when the zone actually changes — prevents flicker on every CD.
          this.maskBoundsPercent = null;
        }
        // Trigger initFromMask whenever the zone has a mask, stageSize is ready, no saved placement,
        // and we haven't initialised yet. Checked on every CD so it fires even when prevMask===currMask
        // (e.g. same zone, but el.touched was reset to false after double-CD workaround).
        if (currMask && this.stageSize && !this.initialSnapshot?.placement && !this.didInitFromMask) {
          this.initFromMask(this.stageSize);
        }
      }
    }
    if (changes['productImagePath'] && !changes['initialSnapshot'] && !changes['markingZone']) {
      this.computeUnavailableReason();
    }
    if (changes['productUnavailableReason']) {
      this.computeUnavailableReason();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup',   this.boundMouseUp);
  }

  private computeUnavailableReason(): void {
    if (this.productUnavailableReason) {
      this.unavailableReason = this.productUnavailableReason;
    } else if (!this.productImagePath) {
      this.unavailableReason = 'Aucune image produit disponible.';
    } else {
      this.unavailableReason = null;
    }
  }

  private initPlacement(): void {
    this.selectedLogoId = this.resolveLogoId();

    const hasMask = Boolean(this.markingZone?.masquePng);


    if (this.initialSnapshot?.placement) {
      this.xPercent = this.initialSnapshot.placement.xPercent;
      this.yPercent = this.initialSnapshot.placement.yPercent;
      this.scalePercent = this.initialSnapshot.placement.scalePercent;
      this.rotationDeg = this.initialSnapshot.placement.rotationDeg;
      this.didInitFromMask = true;
    } else if (hasMask) {
      this.xPercent = 50;
      this.yPercent = 50;
      this.scalePercent = 25;
      this.rotationDeg = 0;
      this.didInitFromMask = false;
    } else {
      this.xPercent = 50;
      this.yPercent = 50;
      this.scalePercent = 35;
      this.rotationDeg = 0;
      this.didInitFromMask = true;
    }
  }

  private resolveLogoId(): number | null {
    if (this.initialSnapshot?.logoId !== undefined) return this.initialSnapshot.logoId;
    if (this.defaultLogoId !== null) return this.defaultLogoId;
    return this.logos[0]?.id ?? null;
  }

  get selectedLogo(): PreviewLogo | null {
    return this.logos.find(l => l.id === this.selectedLogoId) ?? null;
  }

  get selectedLogoPath(): string {
    return this.selectedLogo?.typeApercu === 'image' ? (this.selectedLogo.publicPath ?? '') : '';
  }

  get fullLogoPath(): string {
    return this.selectedLogoPath
      ? `${environment.apiUrl}/${this.selectedLogoPath}`
      : '';
  }

  get fullProductImagePath(): string {
    if (!this.productImagePath) return '';
    if (this.productImagePath.startsWith('data:')) return this.productImagePath;
    return `${environment.apiUrl}/${this.productImagePath}`;
  }

  get fullMaskPath(): string {
    if (!this.markingZone?.masquePng) return '';
    const path = this.markingZone.masquePng.replace(/ /g, '%20');
    return `${environment.apiUrl}/${path}`;
  }

  get resolvedBackgroundElements(): { elementId: string; logoImage: string; xPercent: number; yPercent: number; scalePercent: number; rotationDeg: number }[] {
    return this.backgroundElements
      .map(el => {
        const logo = this.logos.find(l => l.id === el.logoId);
        if (!logo || logo.typeApercu !== 'image' || !logo.publicPath) return null;
        return {
          elementId: el.elementId,
          logoImage: `${environment.apiUrl}/${logo.publicPath}`,
          xPercent: el.xPercent,
          yPercent: el.yPercent,
          scalePercent: el.scalePercent,
          rotationDeg: el.rotationDeg
        };
      })
      .filter((x): x is { elementId: string; logoImage: string; xPercent: number; yPercent: number; scalePercent: number; rotationDeg: number } => x !== null);
  }

  onRenderStageBgClicked(): void {
    this.stageBgClicked.emit();
  }

  onBackgroundElementClicked(elementId: string): void {
    this.backgroundElementSelected.emit(elementId);
  }

  // Appelé quand le stage est prêt (via template ref)
  onStageReady(el: HTMLElement): void {
    this.stageElement = el;
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width > 0 && height > 0) {
        const newSize = { width, height };
        const changed = !this.stageSize || this.stageSize.width !== width || this.stageSize.height !== height;
        if (changed) {
          this.stageSize = newSize;
          if (!this.didInitFromMask && this.markingZone?.masquePng) {
            this.initFromMask(newSize);
          }
          this.cdr.detectChanges();
        }
      }
    });
    this.resizeObserver.observe(el);
  }

  private async initFromMask(stageSize: StageSize): Promise<void> {
    this.maskBoundsPercent = null;
    const maskPath = this.fullMaskPath;
    const logoPath = this.fullLogoPath;
    if (!maskPath || !logoPath) return;

    try {
      const [maskImg, logoImg] = await Promise.all([
        this.loadImage(maskPath),
        this.loadImage(logoPath)
      ]);

      const maskBounds = this.extractMaskBounds(maskImg);
      if (!maskBounds) {
        this.didInitFromMask = true;
        return;
      }

      const displayBox = this.computeDisplayBox(maskBounds, stageSize);
      const boxWidth = maskBounds.maxX - maskBounds.minX + 1;
      const boxHeight = maskBounds.maxY - maskBounds.minY + 1;
      this.maskBoundsPercent = {
        xPercent:      (displayBox.x + (maskBounds.minX / maskBounds.width)  * displayBox.width)  / stageSize.width  * 100,
        yPercent:      (displayBox.y + (maskBounds.minY / maskBounds.height) * displayBox.height) / stageSize.height * 100,
        widthPercent:  (boxWidth  / maskBounds.width)  * (displayBox.width  / stageSize.width)  * 100,
        heightPercent: (boxHeight / maskBounds.height) * (displayBox.height / stageSize.height) * 100,
      };

      const placement = this.computePlacementFromMask(
        maskBounds, logoImg, stageSize,
        this.markingZone?.paddingPercent ?? 5
      );

      this.xPercent = placement.xPercent;
      this.yPercent = placement.yPercent;
      this.scalePercent = placement.scalePercent;
      this.rotationDeg = 0;
      this.didInitFromMask = true;
      // Emit snapshot instead of detectChanges: this saves the computed placement to the parent
      // (el.touched = true, el.placement = computed). On the subsequent CD from onSnapshotChange,
      // initPlacement() sees placement defined → keeps didInitFromMask=true → no re-trigger loop.
      this.emitSnapshot();
    } catch {
      this.didInitFromMask = true;
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image impossible à charger'));
      img.crossOrigin = 'anonymous';
      img.src = src;
    });
  }

  private extractMaskBounds(maskImage: HTMLImageElement): MaskBounds | null {
    const width = maskImage.naturalWidth || maskImage.width;
    const height = maskImage.naturalHeight || maskImage.height;
    if (width <= 0 || height <= 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(maskImage, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height).data;

    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (pixels[(y * width + x) * 4 + 3] === 0) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < minX || maxY < minY) return null;
    return { minX, maxX, minY, maxY, width, height };
  }

  private computeDisplayBox(
    maskBounds: MaskBounds,
    stageSize: StageSize
  ): { x: number; y: number; width: number; height: number } {
    const maskRatio = maskBounds.width / maskBounds.height;
    const stageRatio = stageSize.width / stageSize.height;
    if (stageRatio >= maskRatio) {
      const h = stageSize.height;
      const w = h * maskRatio;
      return { x: (stageSize.width - w) / 2, y: 0, width: w, height: h };
    } else {
      const w = stageSize.width;
      const h = w / maskRatio;
      return { x: 0, y: (stageSize.height - h) / 2, width: w, height: h };
    }
  }

  private computePlacementFromMask(
    maskBounds: MaskBounds,
    logoImage: HTMLImageElement,
    stageSize: StageSize,
    paddingPercent: number
  ): PlacementState {
    const displayBox = this.computeDisplayBox(maskBounds, stageSize);

    const boxWidth = maskBounds.maxX - maskBounds.minX + 1;
    const boxHeight = maskBounds.maxY - maskBounds.minY + 1;
    const centerX = maskBounds.minX + boxWidth / 2;
    const centerY = maskBounds.minY + boxHeight / 2;

    const paddingRatio = Math.min(Math.max(paddingPercent, 0), 40) / 100;
    const usableWidth = Math.max(boxWidth * (1 - paddingRatio * 2), 1);
    const usableHeight = Math.max(boxHeight * (1 - paddingRatio * 2), 1);

    const logoW = logoImage.naturalWidth || logoImage.width;
    const logoH = logoImage.naturalHeight || logoImage.height;
    const logoRatio = logoW > 0 && logoH > 0 ? logoW / logoH : 1;
    const usableRatio = usableWidth / usableHeight;
    const containWidthPx = logoRatio >= usableRatio ? usableWidth : usableHeight * logoRatio;

    const centerXNorm = centerX / maskBounds.width;
    const centerYNorm = centerY / maskBounds.height;
    const containWidthNorm = containWidthPx / maskBounds.width;

    const centerXStage = displayBox.x + centerXNorm * displayBox.width;
    const centerYStage = displayBox.y + centerYNorm * displayBox.height;
    const containWidthStage = containWidthNorm * displayBox.width;

    return {
      xPercent: Math.min(Math.max((centerXStage / stageSize.width) * 100, 0), 100),
      yPercent: Math.min(Math.max((centerYStage / stageSize.height) * 100, 0), 100),
      scalePercent: Math.min(Math.max((containWidthStage / stageSize.width) * 100, 5), 95),
      rotationDeg: 0
    };
  }

  onWheel(event: WheelEvent, container: HTMLElement): void {
    event.preventDefault();
    const step = 15;
    const direction = event.deltaY < 0 ? 1 : -1;
    const newZoom = Math.max(this.zoomLevel + direction * step, 100);
    if (newZoom === this.zoomLevel) return;

    const rect = container.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    const oldScale = this.zoomLevel / 100;
    const newScale = newZoom / 100;

    this.panX = mx - (mx - this.panX) * (newScale / oldScale);
    this.panY = my - (my - this.panY) * (newScale / oldScale);

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    this.panX = Math.min(0, Math.max(this.panX, cw * (1 - newScale)));
    this.panY = Math.min(0, Math.max(this.panY, ch * (1 - newScale)));

    this.zoomLevel = newZoom;
    this.cdr.detectChanges();
  }

  onMouseDown(event: MouseEvent, container: HTMLElement): void {
    const isMiddle   = event.button === 1;
    const isCtrlLeft = event.button === 0 && event.ctrlKey;
    if ((!isMiddle && !isCtrlLeft) || this.zoomLevel <= 100) return;

    event.preventDefault();
    this.isPanning      = true;
    this.panStartMouseX = event.clientX;
    this.panStartMouseY = event.clientY;
    this.panStartX      = this.panX;
    this.panStartY      = this.panY;
    this.panContainer   = container;

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup',   this.boundMouseUp);
    this.cdr.detectChanges();
  }

  private onDocumentMouseMove(event: MouseEvent): void {
    if (!this.isPanning || !this.panContainer) return;
    const scale = this.zoomLevel / 100;
    const cw = this.panContainer.clientWidth;
    const ch = this.panContainer.clientHeight;
    this.panX = Math.min(0, Math.max(this.panStartX + (event.clientX - this.panStartMouseX), cw * (1 - scale)));
    this.panY = Math.min(0, Math.max(this.panStartY + (event.clientY - this.panStartMouseY), ch * (1 - scale)));
    this.cdr.detectChanges();
  }

  private onDocumentMouseUp(_event: MouseEvent): void {
    if (!this.isPanning) return;
    this.isPanning    = false;
    this.panContainer = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup',   this.boundMouseUp);
    this.cdr.detectChanges();
  }

  onPlacementChange(placement: PlacementState): void {
    this.xPercent = placement.xPercent;
    this.yPercent = placement.yPercent;
    this.scalePercent = placement.scalePercent;
    this.rotationDeg = placement.rotationDeg;
    this.emitSnapshot();
  }

  onRemoveLogo(): void {
    this.snapshotChange.emit({
      logoId: null,
      logoName: '',
      logoImagePath: '',
      logoType: 'fallback',
      xPercent: this.xPercent,
      yPercent: this.yPercent,
      scalePercent: this.scalePercent,
      rotationDeg: this.rotationDeg
    });
  }

  private emitSnapshot(): void {
    if (!this.selectedLogo) return;
    this.snapshotChange.emit({
      logoId: this.selectedLogo.id,
      logoName: this.selectedLogo.nomOriginal,
      logoImagePath: this.selectedLogo.publicPath,
      logoType: this.selectedLogo.typeApercu,
      xPercent: this.xPercent,
      yPercent: this.yPercent,
      scalePercent: this.scalePercent,
      rotationDeg: this.rotationDeg
    });
  }
}
