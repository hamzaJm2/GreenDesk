import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnInit,
  OnChanges,
  OnDestroy,
  ChangeDetectorRef,
  SimpleChanges,
  AfterViewInit
} from '@angular/core';
import {CommonModule, NgStyle} from '@angular/common';
import {InteractionMode, InteractionSnapshot, PlacementState} from '../../models/placement';


@Component({
  selector: 'app-product-mockup-render',
  standalone: true,
  imports: [CommonModule,NgStyle],
  templateUrl: './product-mockup-render.html',
  styleUrls: ['./product-mockup-render.scss']
})
export class ProductMockupRenderComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input() productImage = '';
  @Input() masquePng: string | null = null;
  @Input() logoImage = '';
  @Input() xPercent = 50;
  @Input() yPercent = 50;
  @Input() scalePercent = 25;
  @Input() rotationDeg = 0;
  @Input() interactive = false;
  @Input() productAlt = 'Produit sélectionné';
  @Input() logoAlt = 'Logo';
  @Input() maskBounds: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number } | null = null;
  @Input() backgroundElements: { elementId: string; logoImage: string; xPercent: number; yPercent: number; scalePercent: number; rotationDeg: number }[] = [];
  @Input() forceShowBorder: boolean = false;

  @ViewChild('zoneControlEl') zoneControlEl!: ElementRef<HTMLDivElement>;
  @ViewChild('stageEl') stageElRef!: ElementRef<HTMLDivElement>;

  @Output() stageReady = new EventEmitter<HTMLElement>();
  @Output() placementChange = new EventEmitter<PlacementState>();
  @Output() removeLogo = new EventEmitter<void>();
  @Output() backgroundElementClicked = new EventEmitter<string>();
  @Output() stageBgClicked = new EventEmitter<void>();
  @Output() interactionStart = new EventEmitter<void>();
  @Output() interactionEnd = new EventEmitter<void>();

  private readonly SNAP_THRESHOLD = 8;

  hasMask = false;
  isDragging = false;
  interactionActive = false;
  isLogoHovered = false;
  logoAspectRatio = '1';
  zoneStyle: { [key: string]: string } = {};
  showSnapIndicator = false;
  snapAngleLabel = '';
  private snapIndicatorTimer: any = null;

  private interaction: InteractionSnapshot | null = null;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;

  constructor(private cdr: ChangeDetectorRef) {
    this.boundPointerMove = this.onGlobalPointerMove.bind(this);
    this.boundPointerUp = this.onGlobalPointerUp.bind(this);
  }

  ngOnInit(): void {
    this.hasMask = Boolean(this.masquePng);
    this.updateZoneStyle();
    if (this.logoImage) this.loadLogoAspectRatio();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['masquePng']) {
      this.hasMask = Boolean(this.masquePng);
      this.updateZoneStyle();
    }
    if (changes['logoImage'] && this.logoImage) {
      this.loadLogoAspectRatio();
    }
    if (changes['maskBounds']) {
      console.log('[product-mockup-render] maskBounds changed:', this.maskBounds);
    }
  }

  ngOnDestroy(): void {
    this.removeGlobalListeners();
  }
  ngAfterViewInit(): void {
    if (this.stageElRef?.nativeElement) {
      this.stageReady.emit(this.stageElRef.nativeElement);
    }
  }

  onStageBgClick(): void {
    this.stageBgClicked.emit();
  }


  private loadLogoAspectRatio(): void {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        this.logoAspectRatio = String(img.naturalWidth / img.naturalHeight);
        this.cdr.detectChanges();
      }
    };
    img.src = this.logoImage;
  }

  private updateZoneStyle(): void {
    if (this.hasMask && this.masquePng) {
      this.zoneStyle = { '--mask-url': `url("${this.masquePng}")` };
    } else {
      this.zoneStyle = {};
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private normalizeRotation(value: number): number {
    const normalized = ((value + 180) % 360 + 360) % 360 - 180;
    return Number.isFinite(normalized) ? normalized : 0;
  }

  private emitPlacement(next: PlacementState): void {
    this.placementChange.emit({
      xPercent: this.clamp(next.xPercent, 0, 100),
      yPercent: this.clamp(next.yPercent, 0, 100),
      scalePercent: this.clamp(next.scalePercent, 5, 95),
      rotationDeg: this.normalizeRotation(next.rotationDeg)
    });
  }

  onLogoPointerDown(event: PointerEvent): void {
    if (!this.interactive) return;
    this.startInteraction('drag', event);
  }

  onResizePointerDown(event: PointerEvent): void {
    event.stopPropagation();
    this.startInteraction('resize', event);
  }

  onRotatePointerDown(event: PointerEvent): void {
    event.stopPropagation();
    this.startInteraction('rotate', event);
  }

  private startInteraction(mode: InteractionMode, event: PointerEvent): void {
    const zoneEl = this.zoneControlEl?.nativeElement;
    if (!zoneEl) return;
    event.preventDefault();
    event.stopPropagation();

    const zoneRect = zoneEl.getBoundingClientRect();
    const logoEl = (event.target as HTMLElement).closest('.mockup-logo-controls') as HTMLElement | null;
    const logoRect = logoEl?.getBoundingClientRect();
    const logoCenterX = logoRect ? logoRect.left + logoRect.width / 2 : zoneRect.left + zoneRect.width / 2;
    const logoCenterY = logoRect ? logoRect.top + logoRect.height / 2 : zoneRect.top + zoneRect.height / 2;
    const startPointerAngleDeg = (Math.atan2(event.clientY - logoCenterY, event.clientX - logoCenterX) * 180) / Math.PI;

    this.interaction = {
      mode, pointerStartX: event.clientX, pointerStartY: event.clientY,
      startXPercent: this.xPercent, startYPercent: this.yPercent,
      startScalePercent: this.scalePercent, startRotationDeg: this.rotationDeg,
      zoneRect, logoCenterX, logoCenterY, startPointerAngleDeg
    };

    this.interactionActive = true;
    if (mode === 'drag') this.isDragging = true;
    this.interactionStart.emit();
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('pointercancel', this.boundPointerUp);
  }

  private onGlobalPointerMove(event: PointerEvent): void {
    const snap = this.interaction;
    if (!snap) return;

    const deltaX = event.clientX - snap.pointerStartX;
    const deltaY = event.clientY - snap.pointerStartY;

    if (snap.mode === 'drag') {
      this.emitPlacement({
        xPercent: this.clamp(snap.startXPercent + (deltaX / Math.max(snap.zoneRect.width, 1)) * 100, 0, 100),
        yPercent: this.clamp(snap.startYPercent + (deltaY / Math.max(snap.zoneRect.height, 1)) * 100, 0, 100),
        scalePercent: snap.startScalePercent,
        rotationDeg: snap.startRotationDeg
      });
      return;
    }

    if (snap.mode === 'resize') {
      const delta = ((deltaX / Math.max(snap.zoneRect.width, 1)) + (deltaY / Math.max(snap.zoneRect.height, 1))) * 50;
      this.emitPlacement({
        xPercent: snap.startXPercent, yPercent: snap.startYPercent,
        scalePercent: this.clamp(snap.startScalePercent + delta, 5, 95),
        rotationDeg: snap.startRotationDeg
      });
      return;
    }

    const currentAngle = (Math.atan2(event.clientY - snap.logoCenterY, event.clientX - snap.logoCenterX) * 180) / Math.PI;
    const rawRotation = this.normalizeRotation(snap.startRotationDeg + (currentAngle - snap.startPointerAngleDeg));
    const { snapped, didSnap } = this.applyRotationSnap(rawRotation);
    if (didSnap) this.triggerSnapIndicator(snapped);
    this.emitPlacement({
      xPercent: snap.startXPercent, yPercent: snap.startYPercent,
      scalePercent: snap.startScalePercent,
      rotationDeg: snapped
    });
  }

  private onGlobalPointerUp(): void {
    this.interaction = null;
    this.isDragging = false;
    this.interactionActive = false;
    this.removeGlobalListeners();
    this.interactionEnd.emit();
    this.cdr.detectChanges();
  }

  private applyRotationSnap(rotation: number): { snapped: number; didSnap: boolean } {
    for (const angle of [0, 90, 180, -90]) {
      if (this.angularDist(rotation, angle) <= this.SNAP_THRESHOLD) {
        return { snapped: angle, didSnap: true };
      }
    }
    return { snapped: rotation, didSnap: false };
  }

  private angularDist(a: number, b: number): number {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  private triggerSnapIndicator(angle: number): void {
    const display = angle < 0 ? angle + 360 : angle;
    this.snapAngleLabel = `${display}°`;
    this.showSnapIndicator = true;
    if (this.snapIndicatorTimer) clearTimeout(this.snapIndicatorTimer);
    this.snapIndicatorTimer = setTimeout(() => {
      this.showSnapIndicator = false;
      this.snapIndicatorTimer = null;
      this.cdr.detectChanges();
    }, 700);
  }

  private removeGlobalListeners(): void {
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('pointercancel', this.boundPointerUp);
  }
}
