import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input,
  OnChanges, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {PackagingCustomization, PackagingTemplateResponse, PackagingTemplateSummary} from '../../models/Packaging';
import {PackagingService} from '../../services/packaging-service';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-packaging-step',
  templateUrl: './packaging-step-component.html',
  styleUrls: ['./packaging-step-component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class PackagingStepComponent implements OnChanges, AfterViewInit {

  @Input() productId!: number;
  @Input() initialCustomization?: PackagingCustomization;
  @Output() customizationChange = new EventEmitter<PackagingCustomization>();
  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef<HTMLDivElement>;

  templates: PackagingTemplateSummary[] = [];
  selectedTemplate: PackagingTemplateResponse | null = null;
  safeSvg: SafeHtml = '';
  colors: Record<string, string> = {};
  logos: Record<string, string> = {};
  loading = false;

  constructor(private packagingService: PackagingService, private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) this.loadTemplatesForProduct();
  }

  ngAfterViewInit(): void {
    if (this.selectedTemplate) this.renderSvg();
  }

  private loadTemplatesForProduct(): void {
    this.loading = true;
    this.packagingService.listTemplatesForProduct(this.productId).subscribe({
      next: (templates) => {
        this.templates = templates;
        const preselectedId = this.initialCustomization?.packagingTemplateId;
        const toSelect = preselectedId ? templates.find(t => t.id === preselectedId) : templates[0];
        if (toSelect) this.selectTemplate(toSelect.id);
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  selectTemplate(templateId: number): void {
    this.loading = true;
    this.packagingService.getTemplate(templateId).subscribe({
      next: (template) => {
        this.selectedTemplate = template;
        this.colors = {};
        template.colorGroups.forEach(cg => {
          this.colors[cg.svgGroupId] =
            this.initialCustomization?.colors?.[cg.svgGroupId] ?? cg.defaultColorHex ?? '#000000';
        });
        this.logos = { ...(this.initialCustomization?.logos ?? {}) };
        this.loading = false;
        setTimeout(() => this.renderSvg(), 0);
      },
      error: () => (this.loading = false)
    });
  }

  private renderSvg(): void {
    if (!this.selectedTemplate) return;
    this.safeSvg = this.sanitizer.bypassSecurityTrustHtml(this.selectedTemplate.svgFlatContent);
    setTimeout(() => {
      this.applyAllColors();
      this.applyAllLogos();
    }, 0);
  }

  onColorChange(groupId: string, colorHex: string): void {
    this.colors[groupId] = colorHex;
    this.applyColor(groupId, colorHex);
    this.emitChange();
  }

  onLogoUpload(zoneId: string, file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.logos[zoneId] = dataUrl;
      this.applyLogo(zoneId, dataUrl);
      this.emitChange();
    };
    reader.readAsDataURL(file);
  }

  private applyAllColors(): void {
    Object.entries(this.colors).forEach(([groupId, hex]) => this.applyColor(groupId, hex));
  }

  private applyAllLogos(): void {
    Object.entries(this.logos).forEach(([zoneId, dataUrl]) => this.applyLogo(zoneId, dataUrl));
  }

  private applyColor(groupId: string, colorHex: string): void {
    const container = this.svgContainer?.nativeElement;
    if (!container) return;
    const group = container.querySelector<SVGGElement>(`#${CSS.escape(groupId)}`);
    if (!group) return;
    const shapeSelector = 'path, rect, circle, ellipse, polygon, polyline';
    const targets: SVGElement[] = [group, ...Array.from(group.querySelectorAll<SVGElement>(shapeSelector))];
    targets.forEach(el => {
      if (el.tagName.toLowerCase() === 'g') {
        el.setAttribute('fill', colorHex);
      } else {
        el.style.fill = colorHex;
        el.setAttribute('fill', colorHex);
      }
    });
  }

  private applyLogo(zoneId: string, dataUrl: string): void {
    const container = this.svgContainer?.nativeElement;
    if (!container) return;
    const svgRoot = container.querySelector('svg');
    const zoneGroup = container.querySelector<SVGGElement>(`#${CSS.escape(zoneId)}`);
    if (!svgRoot || !zoneGroup) return;

    const bbox = zoneGroup.getBBox();
    const clipId = `clip__${zoneId}`;
    let defs = svgRoot.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svgRoot.prepend(defs);
    }

    let clipPath = svgRoot.querySelector<SVGClipPathElement>(`#${CSS.escape(clipId)}`);
    if (!clipPath) {
      clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath') as SVGClipPathElement;
      clipPath.setAttribute('id', clipId);
      Array.from(zoneGroup.querySelectorAll('path, rect, polygon')).forEach(shape => {
        clipPath!.appendChild(shape.cloneNode(true));
      });
      defs.appendChild(clipPath);
    }

    let logoImage = zoneGroup.querySelector<SVGImageElement>('image[data-role="user-logo"]');
    if (!logoImage) {
      logoImage = document.createElementNS('http://www.w3.org/2000/svg', 'image') as SVGImageElement;
      logoImage.setAttribute('data-role', 'user-logo');
      logoImage.setAttribute('clip-path', `url(#${clipId})`);
      logoImage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      zoneGroup.appendChild(logoImage);
    }

    logoImage.setAttribute('x', String(bbox.x));
    logoImage.setAttribute('y', String(bbox.y));
    logoImage.setAttribute('width', String(bbox.width));
    logoImage.setAttribute('height', String(bbox.height));
    logoImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dataUrl);
    logoImage.setAttribute('href', dataUrl);
  }

  private emitChange(): void {
    if (!this.selectedTemplate) return;
    this.customizationChange.emit({
      packagingTemplateId: this.selectedTemplate.id,
      colors: { ...this.colors },
      logos: { ...this.logos }
    });
  }
}
