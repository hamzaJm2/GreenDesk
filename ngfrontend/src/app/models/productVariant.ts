import {ProductAttributeValue} from './productAttributeValue';

export interface ProductVariant {
  id: number;
  values: ProductAttributeValue[];
  extraPrice: number;
  finalPrice: number;
  isActive: boolean;
  label: string;
}
