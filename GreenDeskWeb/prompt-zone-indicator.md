# GreenDesk — Indicateur de limite de zone de marquage

## Contexte
Lire `greendesk-context-for-claude-code.md` pour l'architecture complète.

## Tâche : Afficher un contour pointillé rouge au survol du logo

### Comportement attendu
Quand `isLogoHovered === true` ou `interactionActive === true` dans `product-mockup-render`, afficher un contour en pointillés rouges qui délimite la zone de marquage sur l'image produit.

### Fichiers concernés

**`product-mockup-render.ts`**
Ajouter un Input pour recevoir les bounds de la zone :
```typescript
@Input() maskBounds: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number } | null = null;
```

**`product-mockup-render.html`**
Ajouter un div overlay qui s'affiche quand le logo est survolé :
```html
<!-- Indicateur zone de marquage -->
<div *ngIf="maskBounds && (isLogoHovered || interactionActive)"
     class="zone-indicator"
     [style.left]="maskBounds.xPercent + '%'"
     [style.top]="maskBounds.yPercent + '%'"
     [style.width]="maskBounds.widthPercent + '%'"
     [style.height]="maskBounds.heightPercent + '%'">
</div>
```

**`product-mockup-render.scss`**
```scss
.zone-indicator {
  position: absolute;
  border: 2px dashed #DC2626;
  border-radius: 2px;
  pointer-events: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}
```

**`product-logo-preview.ts`**
Calculer les bounds de la zone depuis le masque PNG (déjà fait dans `extractMaskBounds` et `computePlacementFromMask`). Ajouter un getter `maskBoundsForIndicator` qui retourne les bounds en pourcentage du stage :

```typescript
maskBoundsPercent: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number } | null = null;
```

Après `initFromMask()`, calculer et stocker les bounds du masque en % du stage pour les passer au composant render.

**`product-logo-preview.html`**
Passer les bounds au composant render :
```html
<app-product-mockup-render
  ...
  [maskBounds]="maskBoundsPercent">
</app-product-mockup-render>
```

## Notes
- Le contour doit correspondre exactement à la bounding box de la zone blanche du masque PNG
- S'affiche seulement au survol ou pendant une interaction (drag/resize/rotate)
- Couleur rouge `#DC2626`, bordure pointillée 2px
- Ne pas bloquer les interactions avec le logo
