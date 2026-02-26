import { Component } from '@angular/core';
import {ProductConfig} from '../product-config/product-config';
import {RouterLink} from '@angular/router';
import {ProductGallery} from '../../shared/product-gallery/product-gallery';

@Component({
  selector: 'app-product-detail',
  imports: [
    ProductConfig,
    RouterLink,
    ProductGallery
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {

}
