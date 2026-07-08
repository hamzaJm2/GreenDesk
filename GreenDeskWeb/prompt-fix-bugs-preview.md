# GreenDesk — Fix bugs auto-placement + zone indicatrice

## Contexte
Lire `greendesk-context-for-claude-code.md` pour l'architecture complète.

## Bug 1 — Logo pas centré dans la zone au démarrage

### Problème
Quand le client ouvre l'étape 3 pour la première fois, le logo apparaît au centre de l'image (50/50) au lieu d'être centré dans la zone de marquage.

### Cause
`loadMarkingZones()` est asynchrone — quand `buildCustomizations()` est appelé, les zones ne sont pas encore chargées. Donc `activeMarkingZone` est null au moment où `product-logo-preview` reçoit son premier `[markingZone]` input.

### Fix dans `nouvelles-maquettes-component.ts`
Dans `loadMarkingZones()`, après avoir chargé les zones, forcer un re-render du composant preview en resetant `touched` sur tous les éléments non touchés :

```typescript
private loadMarkingZones(productId: number): void {
  if (this.markingZonesByProduct[productId]) return;
  this.productService.getProductById(productId).subscribe({
    next: (p) => {
      this.markingZonesByProduct[productId] = p.markingZones ?? [];
      // Reset touched sur les éléments non touchés pour déclencher initFromMask
      const customization = this.customizations.find(c => c.productId === productId);
      if (customization) {
        customization.colorisCustomizations.forEach(cc => {
          cc.variants.forEach(v => {
            v.zonePlacements.forEach(zp => {
              zp.elements.forEach(el => {
                if (!el.touched) {
                  // Forcer ngOnChanges en créant un nouvel objet
                  el.touched = false;
                }
              });
            });
          });
        });
      }
      this.cdr.detectChanges();
    }
  });
}
```

En fait le vrai fix est de forcer `product-logo-preview` à recevoir une nouvelle référence de `markingZone` quand les zones sont chargées. Dans `activeMarkingZone` getter, s'assurer qu'il retourne un nouvel objet à chaque fois que les zones changent.

## Bug 2 — Zone rouge indicatrice invisible

### Problème
Le contour rouge pointillé qui délimite la zone de marquage n'apparaît pas au survol du logo.

### Vérification à faire
1. Dans `product-logo-preview.ts`, vérifier que `maskBoundsPercent` est bien calculé dans `initFromMask()` et non null après l'initialisation.
2. Dans `product-logo-preview.html`, vérifier que `[maskBounds]="maskBoundsPercent"` est bien passé à `app-product-mockup-render`.
3. Dans `product-mockup-render.ts`, vérifier que `@Input() maskBounds` est bien déclaré.
4. Dans `product-mockup-render.html`, vérifier que le div `.zone-indicator` s'affiche quand `maskBounds && (isLogoHovered || interactionActive)`.
5. Dans `product-mockup-render.scss`, vérifier que `.zone-indicator` a `position: absolute` et `z-index` suffisant.

### Fix probable
Le `.zone-indicator` est peut-être dans le mauvais conteneur ou a un `z-index` trop bas. S'assurer que :
```scss
.zone-indicator {
  position: absolute;
  border: 2px dashed #DC2626;
  pointer-events: none;
  z-index: 5;
  opacity: 0.8;
}
```

Et dans le HTML, le div doit être dans `.mockup-viewport` pas dans `.mockup-controls-zone`.

## Test attendu
1. Ouvrir étape 3 → O'Stral → logo centré automatiquement dans Recto sans rien cliquer ✅
2. Survoler le logo → contour rouge pointillé visible autour de la zone de marquage ✅
3. Cliquer `+ Verso` → logo centré dans Verso automatiquement ✅
4. Survoler le logo sur Verso → contour rouge visible ✅
