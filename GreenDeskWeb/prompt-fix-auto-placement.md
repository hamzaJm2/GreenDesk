# GreenDesk — Fix auto-placement logo après refactoring multi-éléments

## Contexte
Lire `greendesk-context-for-claude-code.md` pour l'architecture complète.

## Problème
Après le refactoring multi-éléments (ZoneElement dans ZonePlacement), le logo ne se positionne plus automatiquement au centre de la zone de marquage quand on sélectionne un produit.

## Cause probable
Le getter `activeInitialSnapshot` retourne maintenant `{ logoId, placement }` depuis `activeElement`. Quand `el.touched === false`, il retourne `placement: undefined` ce qui devrait déclencher `initFromMask()` dans `product-logo-preview`. Vérifier que la chaîne complète fonctionne :

1. `activeInitialSnapshot` → `{ logoId: el.logoId, placement: el.touched ? el.placement : undefined }`
2. `product-logo-preview` reçoit `[initialSnapshot]` → `ngOnChanges` → `initPlacement()` → `didInitFromMask = false`
3. `onStageReady` → `ResizeObserver` → `initFromMask(stageSize)` calcule le centre du masque
4. `initFromMask` émet `snapshotChange` → `onSnapshotChange` → met à jour `activeElement.placement` et `activeElement.touched = true`

## Ce qu'il faut vérifier et corriger

### 1. `activeInitialSnapshot` dans `nouvelles-maquettes-component.ts`
Doit retourner `undefined` pour `placement` quand `el.touched === false` :
```typescript
get activeInitialSnapshot(): { logoId: number | null; placement?: PlacementState } | null {
  const el = this.activeElement;
  if (!el) return null;
  return { logoId: el.logoId, placement: el.touched ? el.placement : undefined };
}
```

### 2. `setActiveMarkingZone()` dans `nouvelles-maquettes-component.ts`
Quand on change de zone, reset `touched` de l'élément actif pour forcer recalcul :
```typescript
setActiveMarkingZone(zoneId: number): void {
  const v = this.activeVariant;
  if (!v) return;
  v.activeZoneId = zoneId;
  // Reset touched pour forcer initFromMask
  const zp = v.zonePlacements.find(zp => zp.zoneId === zoneId);
  if (zp) {
    const el = zp.elements.find(el => el.elementId === zp.activeElementId);
    if (el) el.touched = false;
  }
  this.cdr.detectChanges();
}
```

### 3. `addZoneToVariant()` dans `nouvelles-maquettes-component.ts`
Quand on ajoute une nouvelle zone, `touched = false` sur l'élément initial pour déclencher auto-placement :
```typescript
addZoneToVariant(zone: any): void {
  const v = this.activeVariant;
  if (!v) return;
  if (v.zonePlacements.find(zp => zp.zoneId === zone.id)) return;
  v.zonePlacements.push({
    zoneId: zone.id,
    zoneNom: zone.nom,
    elements: [{
      elementId: 'el-1',
      logoId: v.zonePlacements[0]?.elements[0]?.logoId ?? null,
      placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 },
      touched: false  // ← important pour déclencher initFromMask
    }],
    activeElementId: 'el-1',
    touched: false
  });
  v.activeZoneId = zone.id;
  this.cdr.detectChanges();
  this.autoSave();
}
```

### 4. `ngOnChanges` dans `product-logo-preview.ts`
Quand `markingZone` change, reset `maskBoundsPercent` et relance `initFromMask` si `stageSize` disponible :
```typescript
if (changes['markingZone']) {
  this.maskBoundsPercent = null;
  if (this.markingZone?.masquePng && this.stageSize && !this.initialSnapshot?.placement) {
    this.didInitFromMask = false;
    this.initFromMask(this.stageSize);
  }
}
```

## Test attendu
1. Sélectionner O'Stral étape 3 → logo centré automatiquement sur Recto ✅
2. Cliquer "+ Verso" → logo centré automatiquement sur Verso ✅  
3. Cliquer "+ Bouchon" → logo centré automatiquement sur Bouchon ✅
4. Changer de zone (clic sur Recto/Verso/Bouchon) → logo se recentre ✅
5. Flexy → logo centré dans le cercle ✅
