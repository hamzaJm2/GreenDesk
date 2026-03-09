import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.scss',
})
export class ProductGallery implements OnChanges {
  @Input() images: string[] = [];

  selectedImageIndex: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['images']) {
      console.log("🟢 GALLERY IMAGES RECEIVED =", this.images);
      // Réinitialiser l'index si les images changent
      this.selectedImageIndex = 0;
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  prevImage(): void {
    if (this.images.length > 0) {
      if (this.selectedImageIndex > 0) {
        this.selectedImageIndex--;
      } else {
        this.selectedImageIndex = this.images.length - 1;
      }
    }
  }

  nextImage(): void {
    if (this.images.length > 0) {
      if (this.selectedImageIndex < this.images.length - 1) {
        this.selectedImageIndex++;
      } else {
        this.selectedImageIndex = 0;
      }
    }
  }
}
