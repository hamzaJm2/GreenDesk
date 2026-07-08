# GreenDesk — Multi-zones simultanées sur une même variante

## Contexte
Lire `greendesk-context-for-claude-code.md` pour l'architecture complète.

## Objectif
Permettre au client de personnaliser plusieurs zones de marquage simultanément sur une même variante (ex: Recto + Verso + Bouchon en même temps pour O'Stral).

## Changements du modèle de données

### Dans `nouvelles-maquettes-component.ts`

Remplacer `ColorisVariant` par :

```typescript
export interface ZonePlacement {
  zoneId: number;
  zoneNom: string;
  logoId: number | null;
  placement: PlacementState;
  touched: boolean;
}

export interface ColorisVariant {
  variantId: string;
  label: string;
  zonePlacements: ZonePlacement[];  // une entrée par zone active
  activeZoneId: number | null;       // zone active dans l'éditeur
}
```

### Migration des données existantes
Dans `buildCustomizations()`, initialiser la première zone :
```typescript
const firstZone = markingZones[0]; // zone par défaut = première zone configurée
const variant: ColorisVariant = {
  variantId,
  label: 'Variante 1',
  zonePlacements: firstZone ? [{
    zoneId: firstZone.id,
    zoneNom: firstZone.nom,
    logoId: principalLogoId,
    placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 },
    touched: false
  }] : [],
  activeZoneId: firstZone?.id ?? null
};
```

## Getters à modifier

### `activeMarkingZone`
Retourner la zone correspondant à `activeVariant.activeZoneId`.

### `activeInitialSnapshot`
Retourner le placement de la `ZonePlacement` active.

### `activeZonePlacement` (nouveau getter)
```typescript
get activeZonePlacement(): ZonePlacement | null {
  const v = this.activeVariant;
  if (!v || !v.activeZoneId) return null;
  return v.zonePlacements.find(zp => zp.zoneId === v.activeZoneId) ?? null;
}
```

## Méthodes à modifier

### `onSnapshotChange`
Mettre à jour le placement de la `ZonePlacement` active (pas la variante entière).

### `addZoneToVariant(zoneId: number)` (nouvelle méthode)
```typescript
addZoneToVariant(zone: any): void {
  const v = this.activeVariant;
  if (!v) return;
  // Vérifier si la zone n'est pas déjà ajoutée
  if (v.zonePlacements.find(zp => zp.zoneId === zone.id)) return;
  v.zonePlacements.push({
    zoneId: zone.id,
    zoneNom: zone.nom,
    logoId: v.zonePlacements[0]?.logoId ?? null,
    placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 },
    touched: false
  });
  v.activeZoneId = zone.id;
  this.cdr.detectChanges();
  this.autoSave();
}
```

### `removeZoneFromVariant(zoneId: number)` (nouvelle méthode)
```typescript
removeZoneFromVariant(zoneId: number): void {
  const v = this.activeVariant;
  if (!v || v.zonePlacements.length <= 1) return;
  v.zonePlacements = v.zonePlacements.filter(zp => zp.zoneId !== zoneId);
  if (v.activeZoneId === zoneId) {
    v.activeZoneId = v.zonePlacements[0]?.zoneId ?? null;
  }
  this.cdr.detectChanges();
  this.autoSave();
}
```

### `setActiveZone(zoneId: number)` (nouvelle méthode)
```typescript
setActiveZone(zoneId: number): void {
  const v = this.activeVariant;
  if (!v) return;
  v.activeZoneId = zoneId;
  this.cdr.detectChanges();
}
```

## Changements HTML (`nouvelles-maquettes-component.html`)

### Remplacer le sélecteur de zones actuel par :

```html
<!-- Zones de marquage actives -->
<div *ngIf="activeProductMarkingZones.length > 0" class="mb-3">
  <p class="font-poppins text-xs font-semibold mb-2" style="color: var(--c-gray-dark);">Zones de marquage</p>
  
  <!-- Zones actives sur cette variante -->
  <div class="flex flex-wrap gap-2 mb-2">
    <button *ngFor="let zp of activeVariant?.zonePlacements"
            (click)="setActiveZone(zp.zoneId)"
            class="flex items-center gap-1 px-3 py-1.5 rounded-xl font-poppins text-xs font-semibold transition-all border-2"
            [style.border-color]="activeVariant?.activeZoneId === zp.zoneId ? 'var(--c-green-teal)' : 'var(--c-beige)'"
            [style.background-color]="activeVariant?.activeZoneId === zp.zoneId ? '#F0FDF4' : 'var(--c-white)'"
            [style.color]="activeVariant?.activeZoneId === zp.zoneId ? 'var(--c-green-teal)' : 'var(--c-gray-dark)'">
      {{ zp.zoneNom }}
      <span *ngIf="(activeVariant?.zonePlacements?.length ?? 0) > 1"
            (click)="$event.stopPropagation(); removeZoneFromVariant(zp.zoneId)"
            class="ml-1 text-red-400 hover:text-red-600">×</span>
    </button>
  </div>

  <!-- Boutons pour ajouter des zones disponibles -->
  <div class="flex flex-wrap gap-2">
    <button *ngFor="let zone of activeProductMarkingZones"
            *ngIf="!isZoneActive(zone.id)"
            (click)="addZoneToVariant(zone)"
            class="px-3 py-1.5 rounded-xl font-poppins text-xs border-2 border-dashed transition-all"
            style="border-color: var(--c-beige); color: var(--c-gray-dark); background-color: var(--c-white);">
      + {{ zone.nom }}
    </button>
  </div>
  
  <!-- Mention surcoût -->
  <p *ngIf="(activeVariant?.zonePlacements?.length ?? 0) > 1"
     class="font-poppins text-xs mt-2 px-3 py-1.5 rounded-xl"
     style="background-color: #FFFBEB; color: #92400E;">
    ⚠ Des surcouts s'appliquent pour les zones supplémentaires
  </p>
</div>
```

### `isZoneActive(zoneId: number)` (nouveau getter/méthode)
```typescript
isZoneActive(zoneId: number): boolean {
  return this.activeVariant?.zonePlacements.some(zp => zp.zoneId === zoneId) ?? false;
}
```

## Notes importantes
- Garder la compatibilité avec les produits sans zones de marquage (positionnement libre)
- Le PDF doit afficher toutes les zones actives d'une variante côte à côte
- Style GreenDesk : `--c-green-dark`, `--c-green-teal`, `--c-beige`, `font-poppins`, `font-dosis`
- Ne pas casser les fonctionnalités existantes (variantes, couleurs personnalisées, sauvegarde auto)
- Redémarrer ng serve après les modifications
