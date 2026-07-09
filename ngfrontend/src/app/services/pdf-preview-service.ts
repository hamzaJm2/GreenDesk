import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs/pdf.worker.mjs';

@Injectable({ providedIn: 'root' })
export class PdfPreviewService {

  async getPageCount(file: File): Promise<number> {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pageCount = pdf.numPages;
    await pdf.destroy();
    return pageCount;
  }

  async renderFirstPageToPng(file: File, scale = 2): Promise<Blob> {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    try {
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const canvasContext = canvas.getContext('2d')!;
      await page.render({ canvasContext, viewport }).promise;
      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Échec de génération du PNG')), 'image/png');
      });
    } finally {
      await pdf.destroy();
    }
  }
}
