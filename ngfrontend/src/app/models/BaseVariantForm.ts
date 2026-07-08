import {BaseVariantTierForm} from './BaseVariantTierForm';

export interface BaseVariantForm {
  name: string;
  displayOrder: number;
  tiers: BaseVariantTierForm[];
  deliveryDays: string;
}
