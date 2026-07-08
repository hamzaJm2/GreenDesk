import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'findOptionTier', standalone: true })
export class FindOptionTierPipe implements PipeTransform {
  transform(tiers: { qty: number; surcharge: number | null; offert: boolean }[] | undefined, qty: number) {
    return tiers?.find(t => t.qty === qty) ?? null;
  }
}

@Pipe({ name: 'findTier', standalone: true })
export class FindTierPipe implements PipeTransform {
  transform(tiers: { qty: number; unitPrice: number }[] | undefined, qty: number) {
    return tiers?.find(t => t.qty === qty) ?? null;
  }
}
