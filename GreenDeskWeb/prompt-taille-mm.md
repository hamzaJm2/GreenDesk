# GreenDesk — Taille logo en mm

## Contexte
Lire `greendesk-context-for-claude-code.md` pour l'architecture complète.

## Tâche : Afficher la taille réelle du logo en mm dans l'étape 3 des maquettes

### 1. Backend — Entité ProductMarkingZone
Ajouter deux champs dans `ProductMarkingZone.java` :
```java
private Double largeurZoneMm;
private Double hauteurZoneMm;
```
Ajouter les mêmes champs dans `ProductMarkingZoneDTO.java`.
Mettre à jour `ProductMapper` pour mapper ces champs.

### 2. Frontend Admin — admin-produit-params étape 3
Dans le formulaire de zone de marquage, ajouter deux champs de saisie :
- Largeur zone (mm)
- Hauteur zone (mm)

Style cohérent avec le reste (font-poppins, rounded-xl, border var(--c-beige)).

### 3. Frontend Maquettes — nouvelles-maquettes-component

Dans `PreviewMarkingZone` interface (product-logo-preview.ts), ajouter :
```typescript
largeurZoneMm?: number;
hauteurZoneMm?: number;
```

Dans `activeMarkingZone` getter (nouvelles-maquettes-component.ts), mapper ces champs.

Dans le panneau droite de l'éditeur étape 3, après le bloc Logo et avant Couleur personnalisée, afficher :

```html
<div *ngIf="activeMarkingZone?.largeurZoneMm && activeVariant?.placement">
  <p class="font-poppins text-xs font-semibold mb-2 uppercase tracking-wide" 
     style="color: var(--c-gray-dark);">Taille du logo</p>
  <div class="p-3 rounded-xl" style="background-color: var(--c-beige);">
    <p class="font-dosis font-bold" style="color: var(--c-green-dark);">
      {{ getLogoWidthMm() | number:'1.0-1' }} mm × {{ getLogoHeightMm() | number:'1.0-1' }} mm
    </p>
    <p class="font-poppins text-xs mt-1" style="color: var(--c-gray-dark);">
      Zone max : {{ activeMarkingZone?.largeurZoneMm }} × {{ activeMarkingZone?.hauteurZoneMm }} mm
    </p>
  </div>
  <!-- Champ saisie taille souhaitée -->
  <div class="flex items-center gap-2 mt-2">
    <input type="number" 
           [(ngModel)]="desiredLogoWidthMm"
           (ngModelChange)="applyDesiredLogoWidth()"
           class="w-20 px-2 py-1 rounded-lg font-poppins text-xs border focus:outline-none"
           style="border-color: var(--c-beige); color: var(--c-green-dark);"
           placeholder="Ex: 20">
    <span class="font-poppins text-xs" style="color: var(--c-gray-dark);">mm souhaités</span>
  </div>
</div>
```

### 4. Méthodes dans nouvelles-maquettes-component.ts

```typescript
desiredLogoWidthMm: number | null = null;

getLogoWidthMm(): number {
  const zone = this.activeMarkingZone;
  const variant = this.activeVariant;
  if (!zone?.largeurZoneMm || !variant?.placement) return 0;
  return (variant.placement.scalePercent / 100) * zone.largeurZoneMm;
}

getLogoHeightMm(): number {
  const widthMm = this.getLogoWidthMm();
  const cc = this.activeColorisCustomization;
  if (!widthMm || !cc) return 0;
  // ratio logo depuis aspect-ratio
  return widthMm; // simplifié — améliorer si besoin avec ratio réel
}

applyDesiredLogoWidth(): void {
  const zone = this.activeMarkingZone;
  const variant = this.activeVariant;
  if (!zone?.largeurZoneMm || !variant || !this.desiredLogoWidthMm) return;
  const newScale = (this.desiredLogoWidthMm / zone.largeurZoneMm) * 100;
  variant.placement = { ...variant.placement, scalePercent: Math.min(Math.max(newScale, 5), 95) };
  variant.touched = true;
  this.cdr.detectChanges();
  this.autoSave();
}
```

## Notes
- Style GreenDesk : variables CSS `--c-green-dark`, `--c-green-teal`, `--c-beige`, fonts `font-dosis`, `font-poppins`
- Ne pas casser les fonctionnalités existantes
- Redémarrer le backend après modification de l'entité
