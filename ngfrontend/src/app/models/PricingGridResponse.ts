interface PricingGridResponse {
  id: number;
  productId: number;
  productName: string;
  deliveryDays: string;
  notes: string;
  availableQties: number[];
  baseVariants: {
    id: number;
    name: string;
    displayOrder: number;
    deliveryDays: string;
    tiers: { id: number; qty: number; unitPrice: number }[];
  }[];
  optionGroups: {
    id: number;
    name: string;
    required: boolean;
    additionalWeeks: number | null;
    tiers: { id: number; qty: number; surcharge: number | null; offert: boolean }[];
  }[];
  shippingTiers: { id: number; qty: number; fixedCost: number; zone: string }[];
  taxes: { id: number; taxName: string; amountPerUnit: number }[];
}
