# GreenDesk — Zoom aperçu produit

## Contexte
Lire `greendesk-context-for-claude-code.md` pour l'architecture complète.

## Tâche : Ajouter un zoom sur l'aperçu produit dans l'étape 3 des maquettes

### Composant concerné : product-logo-preview

**Dans `product-logo-preview.ts`**, ajouter :
```typescript
zoomLevel = 100; // 50, 75, 100, 125, 150, 200

zoomIn(): void {
  this.zoomLevel = Math.min(this.zoomLevel + 25, 200);
}

zoomOut(): void {
  this.zoomLevel = Math.max(this.zoomLevel - 25, 50);
}

resetZoom(): void {
  this.zoomLevel = 100;
}
```

**Dans `product-logo-preview.html`**, ajouter les boutons zoom AU-DESSUS de `app-product-mockup-render` et wrapper le composant dans un div zoomable :

```html
<!-- Contrôles zoom -->
<div class="flex items-center gap-2 mb-2">
  <button (click)="zoomOut()"
          class="w-7 h-7 rounded-lg font-poppins text-sm font-bold transition-all hover:opacity-80"
          style="background-color: var(--c-beige); color: var(--c-green-dark);">−</button>
  <span class="font-poppins text-xs font-semibold" style="color: var(--c-gray-dark);">{{ zoomLevel }}%</span>
  <button (click)="zoomIn()"
          class="w-7 h-7 rounded-lg font-poppins text-sm font-bold transition-all hover:opacity-80"
          style="background-color: var(--c-beige); color: var(--c-green-dark);">+</button>
  <button (click)="resetZoom()"
          class="px-2 py-1 rounded-lg font-poppins text-xs transition-all hover:opacity-80"
          style="background-color: var(--c-beige); color: var(--c-gray-dark);">↺ Reset</button>
</div>

<!-- Wrapper avec overflow hidden pour contenir le zoom -->
<div class="preview-zoom-container">
  <div class="preview-zoom-inner"
       [style.transform]="'scale(' + zoomLevel/100 + ')'"
       [style.transform-origin]="'top left'"
       [style.width]="(100 * 100/zoomLevel) + '%'">
    <app-product-mockup-render ...></app-product-mockup-render>
  </div>
</div>
```

**Dans `product-logo-preview.scss`**, ajouter :
```scss
.preview-zoom-container {
  overflow: hidden;
  border-radius: 12px;
  width: 100%;
}

.preview-zoom-inner {
  transition: transform 0.2s ease;
  transform-origin: top left;
}
```

## Notes
- Style GreenDesk : `--c-beige`, `--c-green-dark`, `font-poppins`
- Le zoom ne doit pas casser le drag/resize/rotate du logo
- Conserver tous les inputs/outputs existants de app-product-mockup-render
