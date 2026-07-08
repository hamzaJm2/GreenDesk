import {OptionTierForm} from './OptionTierForm';

export interface OptionGroupForm {
  name: string;
  required: boolean;
  additionalWeeks: number | null;
  tiers: OptionTierForm[];
}
