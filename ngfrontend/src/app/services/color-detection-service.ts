import { Injectable } from '@angular/core';

export interface DetectedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  population: number;
  nom: string;
}

@Injectable({ providedIn: 'root' })
export class ColorDetectionService {

  async detectColorsFromUrl(imageUrl: string, maxColors = 5): Promise<DetectedColor[]> {
    try {
      const img = await this.loadImage(imageUrl);
      const pixels = this.extractPixels(img);
      const filtered = this.filterTransparentAndWhite(pixels);
      if (filtered.length === 0) return [];
      const clustered = this.kMeansClustering(filtered, maxColors);
      return clustered
        .sort((a, b) => b.population - a.population)
        .slice(0, maxColors)
        .map(c => ({
          hex: this.rgbToHex(c.r, c.g, c.b),
          rgb: { r: c.r, g: c.g, b: c.b },
          population: c.population,
          nom: this.getColorName(c.r, c.g, c.b)
        }));
    } catch {
      return [];
    }
  }

  async recolorImage(imageUrl: string, targetHex: string, mode: 'full' | 'keep-white' = 'full', maskUrl?: string): Promise<string> {
    try {
      const img = await this.loadImage(imageUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const target = this.hexToRgb(targetHex);
      const [tH, tS] = this.rgbToHsl(target.r, target.g, target.b);

      let maskData: Uint8ClampedArray | null = null;
      if (maskUrl) {
        try {
          const maskImg = await this.loadImage(maskUrl);
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = img.width;
          maskCanvas.height = img.height;
          maskCanvas.getContext('2d')!.drawImage(maskImg, 0, 0, img.width, img.height);
          maskData = maskCanvas.getContext('2d')!.getImageData(0, 0, img.width, img.height).data;
        } catch {
          maskData = null;
        }
      }

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 10) continue;

        // Soft mask blend: use mask alpha as blend weight for clean edges
        let blendFactor = 1.0;
        if (maskData) {
          blendFactor = maskData[i + 3] / 255;
          if (blendFactor < 0.01) continue;
        }

        const r = data[i], g = data[i + 1], b = data[i + 2];
        const [, , origL] = this.rgbToHsl(r, g, b);

        // Preserve bright highlights in keep-white mode
        if (mode === 'keep-white') {
          const [, origS] = this.rgbToHsl(r, g, b);
          if (origL > 0.92 && origS < 0.12) continue;
        }

        // HSL hue substitution: keep original lightness (shadows/highlights/texture),
        // apply target hue and saturation. Highlights fade to white naturally (high L → low perceived S).
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
      return canvas.toDataURL('image/png');
    } catch {
      return imageUrl;
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject();
      img.src = src;
    });
  }

  private extractPixels(img: HTMLImageElement): Array<{ r: number; g: number; b: number }> {
    const canvas = document.createElement('canvas');
    const maxSize = 100;
    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = Math.floor(img.width * ratio);
    canvas.height = Math.floor(img.height * ratio);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
      pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] });
    }
    return pixels.filter(p => p.a > 200).map(p => ({ r: p.r, g: p.g, b: p.b }));
  }

  private filterTransparentAndWhite(pixels: Array<{ r: number; g: number; b: number }>): Array<{ r: number; g: number; b: number }> {
    return pixels.filter(p => {
      const brightness = (p.r + p.g + p.b) / 3;
      const isWhite = brightness > 240;
      const isBlack = brightness < 15;
      const isGray = Math.abs(p.r - p.g) < 10 && Math.abs(p.g - p.b) < 10 && Math.abs(p.r - p.b) < 10;
      return !isWhite && !isBlack && !(isGray && brightness > 200);
    });
  }

  private kMeansClustering(
    pixels: Array<{ r: number; g: number; b: number }>,
    k: number
  ): Array<{ r: number; g: number; b: number; population: number }> {
    if (pixels.length === 0) return [];
    k = Math.min(k, pixels.length);

    let centroids = pixels
      .filter((_, i) => i % Math.floor(pixels.length / k) === 0)
      .slice(0, k)
      .map(p => ({ ...p }));

    let assignments = new Array(pixels.length).fill(0);

    for (let iter = 0; iter < 10; iter++) {
      for (let i = 0; i < pixels.length; i++) {
        let minDist = Infinity;
        let best = 0;
        for (let j = 0; j < centroids.length; j++) {
          const dist = this.colorDistance(pixels[i], centroids[j]);
          if (dist < minDist) { minDist = dist; best = j; }
        }
        assignments[i] = best;
      }

      const newCentroids = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
      for (let i = 0; i < pixels.length; i++) {
        const c = assignments[i];
        newCentroids[c].r += pixels[i].r;
        newCentroids[c].g += pixels[i].g;
        newCentroids[c].b += pixels[i].b;
        newCentroids[c].count++;
      }
      centroids = newCentroids.map(c => ({
        r: c.count > 0 ? Math.round(c.r / c.count) : 0,
        g: c.count > 0 ? Math.round(c.g / c.count) : 0,
        b: c.count > 0 ? Math.round(c.b / c.count) : 0
      }));
    }

    const counts = new Array(k).fill(0);
    assignments.forEach(a => counts[a]++);

    return centroids.map((c, i) => ({ ...c, population: counts[i] }))
      .filter(c => c.population > 0);
  }

  private colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
    return Math.sqrt(
      Math.pow(a.r - b.r, 2) +
      Math.pow(a.g - b.g, 2) +
      Math.pow(a.b - b.b, 2)
    );
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
    if (s === 0) {
      const v = Math.round(l * 255);
      return [v, v, v];
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [Math.round(hue2rgb(h + 1 / 3) * 255), Math.round(hue2rgb(h) * 255), Math.round(hue2rgb(h - 1 / 3) * 255)];
  }

  private getColorName(r: number, g: number, b: number): string {
    const [h, s, l] = this.rgbToHsl(r, g, b);
    if (l < 0.12) return 'Noir';
    if (l > 0.88 && s < 0.12) return 'Blanc';
    if (s < 0.12) {
      if (l < 0.35) return 'Gris foncé';
      if (l < 0.65) return 'Gris';
      return 'Gris clair';
    }
    const hDeg = h * 360;
    let base: string;
    if (hDeg < 15 || hDeg >= 345) base = 'Rouge';
    else if (hDeg < 45)           base = 'Orange';
    else if (hDeg < 70)           base = 'Jaune';
    else if (hDeg < 150)          base = 'Vert';
    else if (hDeg < 195)          base = 'Cyan';
    else if (hDeg < 255)          base = 'Bleu';
    else if (hDeg < 285)          base = 'Violet';
    else if (hDeg < 315)          base = 'Mauve';
    else                          base = 'Rose';
    if (l < 0.28)  return base + ' foncé';
    if (l > 0.72)  return base + ' clair';
    if (s > 0.65)  return base + ' vif';
    return base;
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}
