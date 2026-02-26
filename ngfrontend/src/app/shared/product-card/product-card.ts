import {Component, Input} from '@angular/core';

import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [
    RouterLink
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input() category!: string;
  @Input() title!: string;
  @Input() description!: string;
  @Input() image!: string;
  @Input() count!: number;
  @Input() route!: string;


}
