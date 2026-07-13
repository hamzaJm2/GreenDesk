export interface ComposeCustomColorRasterParams {
  maskUrl: string;
  colorHex: string;
  sourceImageUrl?: string;
  width: number;
  height: number;
  materialStrength?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(value: string): string {
  const raw = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) {
    return raw.toUpperCase();
  }
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    const cleaned = raw.slice(1);
    return `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`.toUpperCase();
  }
  return "#2F8F4E";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex);
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16)
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l };
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === rn) {
    h = ((gn - bn) / delta) % 6;
  } else if (max === gn) {
    h = (bn - rn) / delta + 2;
  } else {
    h = (rn - gn) / delta + 4;
  }
  h *= 60;
  if (h < 0) {
    h += 360;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (h < 60) {
    rn = c;
    gn = x;
  } else if (h < 120) {
    rn = x;
    gn = c;
  } else if (h < 180) {
    gn = c;
    bn = x;
  } else if (h < 240) {
    gn = x;
    bn = c;
  } else if (h < 300) {
    rn = x;
    bn = c;
  } else {
    rn = c;
    bn = x;
  }

  return {
    r: clamp(Math.round((rn + m) * 255), 0, 255),
    g: clamp(Math.round((gn + m) * 255), 0, 255),
    b: clamp(Math.round((bn + m) * 255), 0, 255)
  };
}

function pixelLuminance(pixels: Uint8ClampedArray, index: number): number {
  return (pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114) / 255;
}

function pixelLuminanceAt(pixels: Uint8ClampedArray, width: number, height: number, x: number, y: number): number {
  const safeX = clamp(x, 0, width - 1);
  const safeY = clamp(y, 0, height - 1);
  return pixelLuminance(pixels, (safeY * width + safeX) * 4);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Chargement image impossible."));
    image.decoding = "sync";
    image.src = src;
  });
}

function drawContainedImage(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  if (imageWidth <= 0 || imageHeight <= 0) {
    return;
  }
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const drawWidth = Math.max(1, Math.round(imageWidth * scale));
  const drawHeight = Math.max(1, Math.round(imageHeight * scale));
  const drawX = Math.round((width - drawWidth) / 2);
  const drawY = Math.round((height - drawHeight) / 2);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

export async function composeCustomColorRaster(params: ComposeCustomColorRasterParams): Promise<string | null> {
  const width = Math.max(1, Math.round(params.width));
  const height = Math.max(1, Math.round(params.height));
  if (!params.maskUrl || width <= 0 || height <= 0) {
    return null;
  }

  const maskImage = await loadImage(params.maskUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
  if (!maskContext) {
    return null;
  }
  maskContext.clearRect(0, 0, width, height);
  drawContainedImage(maskContext, maskImage, width, height);
  const maskPixels = maskContext.getImageData(0, 0, width, height).data;

  let sourcePixels: Uint8ClampedArray | null = null;
  if (params.sourceImageUrl) {
    try {
      const sourceImage = await loadImage(params.sourceImageUrl);
      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
      if (sourceContext) {
        sourceContext.clearRect(0, 0, width, height);
        drawContainedImage(sourceContext, sourceImage, width, height);
        sourcePixels = sourceContext.getImageData(0, 0, width, height).data;
      }
      sourceCanvas.width = 0;
      sourceCanvas.height = 0;
    } catch {
      sourcePixels = null;
    }
  }

  const targetRgb = hexToRgb(params.colorHex);
  const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);
  const materialStrength = params.materialStrength ?? 0.38;
  const localContrastStrength = 0.22;
  const minLightness = targetHsl.l <= 0.02 ? 0 : 0.015;
  const maxLightness = targetHsl.l >= 0.98 ? 1 : 0.985;
  let averageLuminance = 0.5;

  if (sourcePixels) {
    let total = 0;
    let count = 0;
    for (let index = 0; index < maskPixels.length; index += 4) {
      const alpha = maskPixels[index + 3];
      if (alpha <= 0) {
        continue;
      }
      total += pixelLuminance(sourcePixels, index);
      count += 1;
    }
    if (count > 0) {
      averageLuminance = total / count;
    }
  }

  const output = context.createImageData(width, height);
  for (let index = 0; index < output.data.length; index += 4) {
    const maskAlpha = maskPixels[index + 3];
    if (maskAlpha <= 0) {
      continue;
    }

    const pixelIndex = index / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const sourceLuminance = sourcePixels ? pixelLuminance(sourcePixels, index) : averageLuminance;
    const localAverage = sourcePixels
      ? (
          pixelLuminanceAt(sourcePixels, width, height, x - 1, y) +
          pixelLuminanceAt(sourcePixels, width, height, x + 1, y) +
          pixelLuminanceAt(sourcePixels, width, height, x, y - 1) +
          pixelLuminanceAt(sourcePixels, width, height, x, y + 1)
        ) / 4
      : averageLuminance;
    const nextLightness = clamp(
      targetHsl.l +
        (sourceLuminance - averageLuminance) * materialStrength +
        (sourceLuminance - localAverage) * localContrastStrength,
      minLightness,
      maxLightness
    );
    const nextRgb = hslToRgb(targetHsl.h, targetHsl.s, nextLightness);
    output.data[index] = nextRgb.r;
    output.data[index + 1] = nextRgb.g;
    output.data[index + 2] = nextRgb.b;
    output.data[index + 3] = maskAlpha;
  }

  context.putImageData(output, 0, 0);
  const dataUrl = canvas.toDataURL("image/png");
  canvas.width = 0;
  canvas.height = 0;
  maskCanvas.width = 0;
  maskCanvas.height = 0;
  return dataUrl;
}
