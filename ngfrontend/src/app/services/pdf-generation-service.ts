import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { environment } from '../environments/environment';
import { MockupProjectDTO } from '../models/mockup';
import { Product } from '../models/product';
import {
  ProductCustomization,
  ColorisCustomization,
  ColorisVariant
} from '../features/nouvelles-maquettes-component/nouvelles-maquettes-component';

export interface PdfGenerationProgress {
  current: number;
  total: number;
  message: string;
}

const C = {
  greenDark:  [27,  77,  46]  as [number, number, number],
  greenTeal:  [52,  130, 90]  as [number, number, number],
  beige:      [245, 240, 234] as [number, number, number],
  beigeCard:  [250, 247, 242] as [number, number, number],
  footerBg:   [237, 233, 226] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  gray:       [120, 120, 120] as [number, number, number],
  grayDark:   [60,  60,  60]  as [number, number, number],
};

@Injectable({ providedIn: 'root' })
export class PdfGenerationService {

  private pdf!: jsPDF;
  private W = 297;
  private H = 210;
  private M = 12;

  private assetCache = new Map<string, string>();

  async generateMaquettePdf(
    project:        MockupProjectDTO,
    customizations: ProductCustomization[],
    allProducts:    Product[],
    showGreenDeskLogo: boolean,
    onProgress:     (p: PdfGenerationProgress) => void
  ): Promise<void> {

    this.pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    this.assetCache.clear();

    const principalLogo =
      project.logos.find(l => String(l.id) === project.logoPrincipalId)
      ?? project.logos[0]
      ?? null;

    let totalPages = 1;
    customizations.forEach(c =>
      c.colorisCustomizations.forEach(cc => totalPages += cc.variants.length)
    );
    let currentPage = 0;

    onProgress({ current: ++currentPage, total: totalPages, message: 'Page de garde...' });
    await this.drawCoverPage(principalLogo, showGreenDeskLogo, project.nomProjet);

    for (const cust of customizations) {
      const product = allProducts.find(p => p.id === cust.productId);
      if (!product) continue;

      for (const cc of cust.colorisCustomizations) {
        for (const variant of cc.variants) {
          this.pdf.addPage();
          onProgress({
            current: ++currentPage,
            total:   totalPages,
            message: `${product.name} — ${cc.colorisNom} — ${variant.label}...`
          });
          await this.drawProductPage(product, cc, variant, principalLogo, project.logos);
        }
      }
    }

    const filename = `${project.nomProjet.replace(/[^a-zA-Z0-9]/g, '_')}_maquette.pdf`;
    this.pdf.save(filename);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PAGE DE GARDE
  // ═══════════════════════════════════════════════════════════════════════════
  private async drawCoverPage(
    principalLogo: any,
    showGreenDeskLogo: boolean,
    nomProjet: string
  ): Promise<void> {
    const pdf = this.pdf;
    const W = this.W, H = this.H;

    pdf.setFillColor(...C.white);
    pdf.rect(0, 0, W, H, 'F');

    const trB64 = await this.tryLoadAsset('pdf-assets/leaves-top-right.png');
    if (trB64) pdf.addImage(trB64, 'PNG', W - 62, 0, 62, 62);

    const blB64 = await this.tryLoadAsset('pdf-assets/leaves-bottom-left.png');
    if (blB64) pdf.addImage(blB64, 'PNG', 0, H - 62, 62, 62);

    if (showGreenDeskLogo) {
      const gdB64 = await this.tryLoadAsset('pdf-assets/greendesk-logo.png');
      if (gdB64) {
        pdf.addImage(gdB64, 'PNG', 12, 8, 28, 32);
      } else {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.setTextColor(...C.greenDark);
        pdf.text('Green', 14, 22);
        pdf.text('Desk',  14, 30);
      }
    }

    if (principalLogo) {
      const logoUrl = `${environment.apiUrl}/${principalLogo.publicPath}`;
      const logoB64 = await this.tryLoadUrl(logoUrl);
      if (logoB64) {
        const dims  = await this.getImageDimensions(logoUrl);
        const maxW = 90, maxH = 55;
        const ratio = Math.min(maxW / dims.width, maxH / dims.height);
        const lW = dims.width  * ratio;
        const lH = dims.height * ratio;
        const fmt = this.getImageFormat(principalLogo.publicPath);
        pdf.addImage(logoB64, fmt, (W - lW) / 2, (H - lH) / 2 - 8, lW, lH);
      } else {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.setTextColor(...C.greenDark);
        pdf.text(nomProjet, W / 2, H / 2, { align: 'center' });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PAGE PRODUIT
  // ═══════════════════════════════════════════════════════════════════════════
  private async drawProductPage(
    product:       Product,
    cc:            ColorisCustomization,
    variant:       ColorisVariant,
    principalLogo: any,
    allLogos:      any[]
  ): Promise<void> {
    const pdf = this.pdf;
    const W = this.W, H = this.H, M = this.M;

    pdf.setFillColor(...C.beige);
    pdf.rect(0, 0, W, H, 'F');

    const cardX = M, cardY = M;
    const cardW = W - M * 2;
    const cardH = H - M * 2 - 14;
    pdf.setFillColor(...C.white);
    pdf.roundedRect(cardX, cardY, cardW, cardH, 5, 5, 'F');

    const leftW  = 66;
    const leftX  = cardX + 7;
    const rightW = 60;
    const rightX = cardX + cardW - rightW - 5;
    const centerX = leftX + leftW + 4;
    const centerW = rightX - centerX - 4;

    // ═══════════════════════════════════════════════════════════════════════
    //  COL GAUCHE — Nom + Points forts + Label
    // ═══════════════════════════════════════════════════════════════════════

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(...C.greenDark);
    pdf.text(product.name, leftX, cardY + 14);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...C.grayDark);
    const subLines = pdf.splitTextToSize((product.shortDescription ?? '').replace(/!\s*$/, '').trim(), leftW);
    pdf.text(subLines.slice(0, 2), leftX, cardY + 20);

    // ── Points forts : utiliser strengthItems si disponibles ─────────────
    const hasStrengthItems = (product as any).strengthItems?.length > 0;

    if (hasStrengthItems) {
      // Nouveau format structuré
      let yPos = cardY + 30;
      for (const s of (product as any).strengthItems.slice(0, 7)) {
        if (yPos > cardY + cardH - 38) break;

        // Cercle icône
        pdf.setFillColor(...C.beigeCard);
        pdf.circle(leftX + 4, yPos + 1.5, 4.5, 'F');
        pdf.setFillColor(...C.greenTeal);
        pdf.circle(leftX + 4, yPos + 1.5, 1.8, 'F');

        // Titre bold
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(...C.greenDark);
        const titreLines = pdf.splitTextToSize(s.titre ?? '', leftW - 12);
        pdf.text(titreLines[0], leftX + 10, yPos + 2.5);
        let nextY = yPos + 7;
        if (titreLines.length > 1) {
          pdf.text(titreLines[1], leftX + 10, yPos + 6.5);
          nextY = yPos + 11;
        }

        // Phrase description
        if (s.phrase) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.5);
          pdf.setTextColor(...C.gray);
          const detLines = pdf.splitTextToSize(s.phrase, leftW - 12);
          pdf.text(detLines.slice(0, 2), leftX + 10, nextY);
          nextY += detLines.length > 1 ? 9 : 5;
        }

        yPos = nextY + 2;
      }
    } else if (product.strengths?.length) {
      // Ancien format legacy (texte simple)
      let yPos = cardY + 30;
      for (const s of product.strengths.slice(0, 7)) {
        if (yPos > cardY + cardH - 38) break;

        pdf.setFillColor(...C.beigeCard);
        pdf.circle(leftX + 4, yPos + 1.5, 4.5, 'F');
        pdf.setFillColor(...C.greenTeal);
        pdf.circle(leftX + 4, yPos + 1.5, 1.8, 'F');

        const colonIdx = s.indexOf(':');
        const hasColon = colonIdx > 0 && colonIdx < 40;
        const titre  = hasColon ? s.slice(0, colonIdx).trim() : s;
        const detail = hasColon ? s.slice(colonIdx + 1).trim() : '';

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(...C.greenDark);
        const titreLines = pdf.splitTextToSize(titre, leftW - 12);
        pdf.text(titreLines[0], leftX + 10, yPos + 2.5);
        let nextY = yPos + 7;
        if (titreLines.length > 1) {
          pdf.text(titreLines[1], leftX + 10, yPos + 6.5);
          nextY = yPos + 11;
        }

        if (detail) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.5);
          pdf.setTextColor(...C.gray);
          const detLines = pdf.splitTextToSize(detail, leftW - 12);
          pdf.text(detLines.slice(0, 2), leftX + 10, nextY);
          nextY += detLines.length > 1 ? 9 : 5;
        }

        yPos = nextY + 2;
      }
    }

    // ── Label FIF / OFG depuis BDD ────────────────────────────────────────
    const labelType = (product as any).labelType as string | null;
    const labelY = cardY + cardH - 34;

    if (labelType === 'OFG') {
      const labelB64 = await this.tryLoadAsset('pdf-assets/label-origine-france.png');
      if (labelB64) {
        pdf.addImage(labelB64, 'PNG', leftX, labelY, 20, 20);
      } else {
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7);
        pdf.setTextColor(...C.greenDark);
        pdf.text('ORIGINE FRANCE', leftX, labelY + 8);
        pdf.text('GARANTIE', leftX, labelY + 14);
      }
    } else if (labelType === 'FIF' || labelType === null || labelType === undefined) {
      // Par défaut FIF si pas défini
      const labelB64 = await this.tryLoadAsset('pdf-assets/label-fab-france.png');
      if (labelB64) {
        pdf.addImage(labelB64, 'PNG', leftX, labelY + 2, 22, 18);
      } else {
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7);
        pdf.setTextColor(...C.greenDark);
        pdf.text('FABRIQUÉ EN', leftX, labelY + 8);
        pdf.setFontSize(11);
        pdf.text('FRANCE', leftX, labelY + 15);
      }
    }
    // NONE → pas de label affiché

    // ═══════════════════════════════════════════════════════════════════════
    //  CENTRE — Image produit
    // ═══════════════════════════════════════════════════════════════════════
    const imgUrl = `${environment.apiUrl}/${cc.colorisImageProduit}`;
    // For recolorization, use the white base image when available — not the already-colored preview.
    const srcUrl = (cc.couleurPersonnalisable && cc.imageBaseBlanc && cc.selectedColor)
      ? `${environment.apiUrl}/${cc.imageBaseBlanc}`
      : imgUrl;
    let imgB64 = await this.tryLoadUrl(srcUrl);

    if (imgB64 && cc.selectedColor) {
      const mode = product.name.toLowerCase().includes('moka') ? 'full' : 'keep-white';
      const maskUrl = cc.colorisMaskPath ? `${environment.apiUrl}/${cc.colorisMaskPath}` : null;
      imgB64 = await this.recolorImageForPdf(imgB64, cc.selectedColor, mode, maskUrl);
    }

    if (imgB64) {
      const dims  = await this.getImageDimensions(imgUrl);
      const maxIW = centerW * 0.94;
      const maxIH = (cardH - 8) * 0.90;
      const ratio = Math.min(maxIW / dims.width, maxIH / dims.height);
      const iW = dims.width  * ratio;
      const iH = dims.height * ratio;
      const ix = centerX + (centerW - iW) / 2;
      const iy = cardY + 4 + ((cardH - 8) - iH) / 2;
      pdf.addImage(imgB64, this.getImageFormat(cc.colorisImageProduit), ix, iy, iW, iH);

      for (const zp of variant.zonePlacements ?? []) {
        const maskZone = (product as any).markingZones?.find((z: any) => z.id === zp.zoneId);
        const maskUrl = maskZone?.masquePng ? `${environment.apiUrl}/${maskZone.masquePng}` : null;

        for (const el of zp.elements ?? []) {
          if (!el.logoId || !el.placement) continue;
          const logoToPlace = allLogos.find((l: any) => l.id === el.logoId) ?? principalLogo;
          if (!logoToPlace) continue;
          const placedLogoUrl = `${environment.apiUrl}/${logoToPlace.publicPath}`;
          const placedLogoB64Raw = await this.tryLoadUrl(placedLogoUrl);
          if (!placedLogoB64Raw) continue;

          const logoDims = await this.getImageDimensions(placedLogoUrl);
          const logoNaturalRatio = logoDims.width / logoDims.height;
          const logoW_mm = (el.placement.scalePercent / 100) * iW;
          const logoH_mm = logoW_mm / logoNaturalRatio;
          const logoCenterX = ix + (el.placement.xPercent / 100) * iW;
          const logoCenterY = iy + (el.placement.yPercent / 100) * iH;

          let finalLogoB64 = placedLogoB64Raw;
          if (maskUrl) {
            finalLogoB64 = await this.applyMaskToLogo(
              placedLogoB64Raw, maskUrl,
              el.placement.xPercent, el.placement.yPercent,
              el.placement.scalePercent, logoNaturalRatio
            );
          }

          const rotated = await this.applyRotationToLogo(finalLogoB64, el.placement.rotationDeg ?? 0, logoW_mm, logoH_mm);
          pdf.addImage(rotated.b64, 'PNG', logoCenterX - rotated.w_mm / 2, logoCenterY - rotated.h_mm / 2, rotated.w_mm, rotated.h_mm);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  COL DROITE — Logo client + 3 boîtes info
    // ═══════════════════════════════════════════════════════════════════════

    if (principalLogo) {
      const logoUrl = `${environment.apiUrl}/${principalLogo.publicPath}`;
      const logoB64 = await this.tryLoadUrl(logoUrl);
      if (logoB64) {
        const dims  = await this.getImageDimensions(logoUrl);
        const maxLW = rightW - 4, maxLH = 18;
        const ratio = Math.min(maxLW / dims.width, maxLH / dims.height);
        const lW = dims.width  * ratio;
        const lH = dims.height * ratio;
        pdf.addImage(logoB64, this.getImageFormat(principalLogo.publicPath),
          rightX + (rightW - lW) / 2, cardY + 5, lW, lH);
      }
    }

    let infoY = cardY + 27;
    const dimTab      = product.tabs?.find((t: any) => t.tabKey === 'dimensions');
    const marquageTab = product.tabs?.find((t: any) => t.tabKey === 'marquage');
    const colorisTab  = product.tabs?.find((t: any) => t.tabKey === 'coloris');

    if (dimTab?.content) {
      infoY = this.drawInfoBox(pdf, rightX, infoY, rightW, 'DIMENSIONS', dimTab.content);
      infoY += 4;
    }
    if (marquageTab?.content) {
      infoY = this.drawInfoBox(pdf, rightX, infoY, rightW, 'PERSONNALISATION', marquageTab.content);
      infoY += 4;
    }
    if (colorisTab?.content) {
      this.drawInfoBox(pdf, rightX, infoY, rightW, 'COLORIS DISPONIBLES', colorisTab.content);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  FOOTER
    // ═══════════════════════════════════════════════════════════════════════
    const footerY = cardY + cardH + 1;
    const footerH = 13;
    pdf.setFillColor(...C.footerBg);
    pdf.roundedRect(cardX, footerY, cardW, footerH, 3, 3, 'F');

    const midY = footerY + footerH / 2;

    const cX = cardX + 10;
    if (cc.colorisCodeHex) {
      const rgb = this.hexToRgb(cc.colorisCodeHex);
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      const bright = rgb.r + rgb.g + rgb.b > 600;
      if (bright) {
        pdf.setDrawColor(160, 160, 160);
        pdf.setLineWidth(0.4);
        pdf.circle(cX, midY, 4, 'FD');
      } else {
        pdf.circle(cX, midY, 4, 'F');
      }
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...C.greenDark);
    pdf.text(cc.colorisNom, cX + 7, midY + 1.2);

    const bX = cardX + cardW - 40;
    const variantNum = cc.variants.indexOf(variant) + 1;
    pdf.setFillColor(...C.greenTeal);
    pdf.circle(bX, midY, 4.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...C.white);
    pdf.text(String(variantNum), bX, midY + 1.2, { align: 'center' });
    pdf.setFontSize(8.5);
    pdf.setTextColor(...C.greenDark);
    pdf.text(variant.label, bX + 7, midY + 1.2);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  BOÎTE INFO
  // ═══════════════════════════════════════════════════════════════════════════
  private drawInfoBox(
    pdf: jsPDF, x: number, y: number, w: number,
    title: string, content: string
  ): number {
    // Tenter de parser le JSON structuré
    let textContent = content;
    try {
      const parsed = JSON.parse(content);
      textContent = this.parseStructuredContent(parsed);
    } catch {
      textContent = this.stripHtml(content);
    }

    pdf.setFontSize(6.5);
    const lines = pdf.splitTextToSize(textContent, w - 7);
    const nbLines = Math.min(lines.length, 8);
    const boxH = 11 + nbLines * 4.2;

    pdf.setFillColor(...C.beigeCard);
    pdf.roundedRect(x, y, w, boxH, 2.5, 2.5, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...C.greenTeal);
    pdf.text(title, x + 3.5, y + 6);

    pdf.setDrawColor(...C.greenTeal);
    pdf.setLineWidth(0.25);
    const sepY = y + 7.8;
    let dotX = x + 3;
    while (dotX < x + w - 3) {
      pdf.line(dotX, sepY, dotX + 0.5, sepY);
      dotX += 1.4;
    }

    let textY = y + 11.5;
    const rawLines = textContent.split('\n').filter((l: string) => l.trim());
    for (const line of rawLines) {
      if (textY > y + boxH - 1.5) break;
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < 25) {
        const label = line.slice(0, colonIdx).trim();
        const val   = line.slice(colonIdx + 1).trim();
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(...C.grayDark);
        pdf.text(label + ':', x + 3.5, textY);
        textY += 3.5;
        if (textY > y + boxH - 1.5) break;
        pdf.setFont('helvetica', 'normal');
        const valLines = pdf.splitTextToSize(val, w - 7);
        for (const vl of valLines.slice(0, 2)) {
          if (textY > y + boxH - 1.5) break;
          pdf.text(vl, x + 3.5, textY);
          textY += 3.5;
        }
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(...C.grayDark);
        const wrapped = pdf.splitTextToSize(line, w - 7);
        for (const wl of wrapped.slice(0, 3)) {
          if (textY > y + boxH - 1.5) break;
          pdf.text(wl, x + 3.5, textY);
          textY += 3.5;
        }
      }
      textY += 1;
    }

    return y + boxH;
  }

  /** Convertit un objet JSON structuré en texte lisible pour le PDF */
  private parseStructuredContent(parsed: any): string {
    if (!parsed) return '';

    // Dimensions / coloris : { items: [{nom, valeur}] } ou [{label, valeur}]
    if (parsed.items && Array.isArray(parsed.items)) {
      return parsed.items
        .map((item: any) => `${item.nom ?? item.label}: ${item.valeur}`)
        .filter((l: string) => l.trim() !== ': ')
        .join('\n');
    }

    // Poids : { valeur, unite }
    if (parsed.valeur !== undefined && parsed.unite !== undefined) {
      return `${parsed.valeur} ${parsed.unite}`;
    }

    // Marquage : { type, dimensions, nominatif }
    if (parsed.type !== undefined || parsed.dimensions !== undefined) {
      const lines = [];
      if (parsed.type) lines.push(`Type: ${parsed.type}`);
      if (parsed.dimensions) lines.push(`Dimensions: ${parsed.dimensions}`);
      if (parsed.nominatif !== undefined) lines.push(`Nominatif: ${parsed.nominatif ? 'Oui' : 'Non'}`);
      return lines.join('\n');
    }

    // Emballage : { description, dimensions: [{label, valeur}] }
    if (parsed.description !== undefined) {
      const lines = [];
      if (parsed.description) lines.push(parsed.description);
      if (parsed.dimensions?.length) {
        parsed.dimensions.forEach((d: any) => lines.push(`${d.label}: ${d.valeur}`));
      }
      return lines.join('\n');
    }

    return '';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHARGEMENT D'IMAGES
  // ═══════════════════════════════════════════════════════════════════════════

  private async recolorImageForPdf(
    base64: string,
    targetHex: string,
    mode: 'full' | 'keep-white' = 'full',
    maskUrl: string | null = null
  ): Promise<string> {
    const maskB64 = maskUrl ? await this.tryLoadUrl(maskUrl) : null;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const applyRecolor = (maskData: Uint8ClampedArray | null) => {
          const data = imageData.data;
          const target = this.hexToRgb(targetHex);
          const [tH, tS] = this.rgbToHsl(target.r, target.g, target.b);
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 10) continue;
            let blendFactor = 1.0;
            if (maskData) {
              blendFactor = maskData[i + 3] / 255;
              if (blendFactor < 0.01) continue;
            }
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const [, , origL] = this.rgbToHsl(r, g, b);
            if (mode === 'keep-white' && origL > 0.92) continue;
            const satScale = origL < 0.8 ? 1.0 : Math.max(0, (1.0 - origL) / 0.2);
            const [newR, newG, newB] = this.hslToRgb(tH, tS * satScale, origL);
            if (blendFactor >= 0.99) {
              data[i] = newR; data[i + 1] = newG; data[i + 2] = newB;
            } else {
              data[i]     = Math.round(r * (1 - blendFactor) + newR * blendFactor);
              data[i + 1] = Math.round(g * (1 - blendFactor) + newG * blendFactor);
              data[i + 2] = Math.round(b * (1 - blendFactor) + newB * blendFactor);
            }
          }
          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };

        if (maskB64) {
          const maskImg = new Image();
          maskImg.onload = () => {
            const mc = document.createElement('canvas');
            mc.width  = img.naturalWidth;
            mc.height = img.naturalHeight;
            mc.getContext('2d')!.drawImage(maskImg, 0, 0, img.naturalWidth, img.naturalHeight);
            applyRecolor(mc.getContext('2d')!.getImageData(0, 0, mc.width, mc.height).data);
          };
          maskImg.onerror = () => applyRecolor(null);
          maskImg.src = maskB64;
        } else {
          applyRecolor(null);
        }
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  }

  private async applyMaskToLogo(
    logoDataUrl: string,
    maskUrl: string,
    xPercent: number,
    yPercent: number,
    scalePercent: number,
    logoNaturalRatio: number
  ): Promise<string> {
    const maskB64 = await this.tryLoadUrl(maskUrl);
    if (!maskB64) return logoDataUrl;

    return new Promise((resolve) => {
      const logoImg = new Image();
      const maskImg = new Image();
      let loaded = 0;

      const draw = () => {
        const SZ = 1000;
        const canvas = document.createElement('canvas');
        canvas.width = SZ;
        canvas.height = SZ;
        const ctx = canvas.getContext('2d')!;

        const lW = (scalePercent / 100) * SZ;
        const lH = lW / logoNaturalRatio;
        const lX = (xPercent / 100) * SZ - lW / 2;
        const lY = (yPercent / 100) * SZ - lH / 2;

        ctx.drawImage(logoImg, lX, lY, lW, lH);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(maskImg, 0, 0, SZ, SZ);
        ctx.globalCompositeOperation = 'source-over';

        const cropX = Math.max(0, Math.floor(lX));
        const cropY = Math.max(0, Math.floor(lY));
        const cropW = Math.min(SZ - cropX, Math.ceil(lW));
        const cropH = Math.min(SZ - cropY, Math.ceil(lH));

        const out = document.createElement('canvas');
        out.width = Math.max(1, cropW);
        out.height = Math.max(1, cropH);
        out.getContext('2d')!.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        resolve(out.toDataURL('image/png'));
      };

      logoImg.onload = () => { if (++loaded === 2) draw(); };
      maskImg.onload = () => { if (++loaded === 2) draw(); };
      logoImg.onerror = () => resolve(logoDataUrl);
      maskImg.onerror = () => resolve(logoDataUrl);
      logoImg.src = logoDataUrl;
      maskImg.src = maskB64;
    });
  }

  private async applyRotationToLogo(
    logoDataUrl: string,
    rotationDeg: number,
    logoW_mm: number,
    logoH_mm: number
  ): Promise<{ b64: string; w_mm: number; h_mm: number }> {
    if (!rotationDeg) return { b64: logoDataUrl, w_mm: logoW_mm, h_mm: logoH_mm };

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const rad  = (rotationDeg * Math.PI) / 180;
        const cosA = Math.abs(Math.cos(rad));
        const sinA = Math.abs(Math.sin(rad));
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;

        const newW = Math.ceil(srcW * cosA + srcH * sinA);
        const newH = Math.ceil(srcW * sinA + srcH * cosA);

        const canvas = document.createElement('canvas');
        canvas.width  = newW;
        canvas.height = newH;
        const ctx = canvas.getContext('2d')!;

        ctx.save();
        ctx.translate(newW / 2, newH / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -srcW / 2, -srcH / 2);
        ctx.restore();

        const mmPerPx = logoW_mm / srcW;
        resolve({ b64: canvas.toDataURL('image/png'), w_mm: newW * mmPerPx, h_mm: newH * mmPerPx });
      };
      img.onerror = () => resolve({ b64: logoDataUrl, w_mm: logoW_mm, h_mm: logoH_mm });
      img.src = logoDataUrl;
    });
  }

  private async tryLoadAsset(path: string): Promise<string | null> {
    if (this.assetCache.has(path)) return this.assetCache.get(path)!;
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          this.assetCache.set(path, result);
          resolve(result);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  }

  private async tryLoadUrl(url: string): Promise<string | null> {
    if (this.assetCache.has(url)) return this.assetCache.get(url)!;
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width  = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d')!.drawImage(img, 0, 0);
          const b64 = canvas.toDataURL('image/png');
          this.assetCache.set(url, b64);
          resolve(b64);
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 100, height: 100 });
      img.src = url;
    });
  }

  private getImageFormat(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    return (ext === 'jpg' || ext === 'jpeg') ? 'JPEG' : 'PNG';
  }

  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
    return [h, s, l];
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [Math.round(hue2rgb(h + 1 / 3) * 255), Math.round(hue2rgb(h) * 255), Math.round(hue2rgb(h - 1 / 3) * 255)];
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r
      ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
      : { r: 200, g: 200, b: 200 };
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
