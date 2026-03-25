import {ProductAttributeValue} from './productAttributeValue';

export interface ProductAttribute {
  id?: number;
  name: string;
  values: ProductAttributeValue[];
}
