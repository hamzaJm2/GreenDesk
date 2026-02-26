import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {ProductCard} from '../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    ProductCard
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
