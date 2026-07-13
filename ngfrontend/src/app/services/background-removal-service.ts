import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BackgroundRemovalService {

  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject();
      img.src = src;
    });
  }

  /**
   * Rend transparent le fond blanc/quasi-blanc connecté aux bords de l'image (flood-fill
   * depuis le contour), pour ne pas toucher aux zones blanches internes légitimes du dessin
   * (texte blanc, rond blanc, etc.). `threshold` (0-255) contrôle la tolérance de blancheur.
   */
  removeWhiteBackground(img: HTMLImageElement, threshold: number): string {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const divisor = Math.max(threshold, 1);

    const whiteness = (i: number): number =>
      Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]);

    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let head = 0, tail = 0;

    const tryEnqueue = (x: number, y: number) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const p = y * width + x;
      if (visited[p]) return;
      const i = p * 4;
      if (data[i + 3] === 0 || whiteness(i) <= threshold) {
        visited[p] = 1;
        queue[tail++] = p;
      }
    };

    for (let x = 0; x < width; x++) {
      tryEnqueue(x, 0);
      tryEnqueue(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      tryEnqueue(0, y);
      tryEnqueue(width - 1, y);
    }

    while (head < tail) {
      const p = queue[head++];
      const x = p % width;
      const y = (p - x) / width;
      const i = p * 4;
      if (data[i + 3] > 0) {
        const factor = Math.min(1, whiteness(i) / divisor);
        data[i + 3] = Math.round(data[i + 3] * factor);
      }
      tryEnqueue(x - 1, y);
      tryEnqueue(x + 1, y);
      tryEnqueue(x, y - 1);
      tryEnqueue(x, y + 1);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }
}
