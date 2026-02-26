export interface Product {
  id: number;
  name: string;
  category: 'box' | 'plastique' | 'electronique' | 'tissus';
  categoryName: string;
  price: number;
  deliveryPrice: number;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  configurations?: ProductConfig[];
  achievements?: string[];
  isNew: boolean;
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
