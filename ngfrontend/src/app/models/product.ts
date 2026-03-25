import {ProductTabContent} from '../home/productTabContent';
import {ProductAttribute} from './productAttribute';
import {ProductVariant} from './productVariant';

export interface Product {
  id: number;
  name: string;
  category: string;
  categoryTitle: string;
  deliveryPrice: number;
  image: string;
  description: string;
  gallery: string[];
  achievements: string[];
  categoryId: number;
  new: boolean;
  price?: number;
  tabs?: ProductTabContent[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
}


export interface ProductConfig {
  id: number;
  name: string;
  options: ConfigOption[];
  price: number;
}

export interface ConfigOption {
  id: number;
  name: string;
  price: number;
  image?: string;
}
