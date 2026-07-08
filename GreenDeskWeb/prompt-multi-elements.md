# GreenDesk — Multi-éléments superposés sur une même zone

## Contexte
Lire `greendesk-context-for-claude-code.md` pour l'architecture complète.
Lire aussi `prompt-multi-zones.md` pour comprendre le modèle ZonePlacement déjà implémenté.

## Objectif
Permettre au client de placer plusieurs éléments visuels superposés sur une même zone de marquage (ex: photo de fond + logo par dessus sur le Flexy).

## Changements du modèle de données

### Dans `nouvelles-maquettes-component.ts`

Ajouter l'interface `ZoneElement` et modifier `ZonePlacement` :

```typescript
export interface ZoneElement {
  elementId: string;   // ex: "el-1", "el-2"
  logoId: number | null;
  placement: PlacementState;
  touched: boolean;
}

export interface ZonePlacement {
  zoneId: number;
  zoneNom: string;
  elements: ZoneElement[];        // liste d'éléments superposés
  activeElementId: string | null; // élément actif dans l'éditeur
  touched: boolean;
}
```

### Migration buildCustomizations()
Initialiser avec un élément par défaut :
```typescript
zonePlacements: [{
  zoneId: firstZone.id,
  zoneNom: firstZone.nom,
  elements: [{
    elementId: 'el-1',
    logoId: principalLogoId,
    placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 },
    touched: false
  }],
  activeElementId: 'el-1',
  touched: false
}]
```

## Nouveaux getters

```typescript
get activeZonePlacement(): ZonePlacement | null {
  const v = this.activeVariant;
  if (!v || !v.activeZoneId) return null;
  return v.zonePlacements.find(zp => zp.zoneId === v.activeZoneId) ?? null;
}

get activeElement(): ZoneElement | null {
  const zp = this.activeZonePlacement;
  if (!zp) return null;
  return zp.elements.find(el => el.elementId === zp.activeElementId) ?? zp.elements[0] ?? null;
}

get activeInitialSnapshot(): { logoId: number | null; placement?: PlacementState } | null {
  const el = this.activeElement;
  if (!el) return null;
  return { logoId: el.logoId, placement: el.touched ? el.placement : undefined };
}
```

## Nouvelles méthodes

```typescript
addElementToZone(): void {
  const zp = this.activeZonePlacement;
  if (!zp) return;
  const newId = `el-${zp.elements.length + 1}`;
  zp.elements.push({
    elementId: newId,
    logoId: zp.elements[0]?.logoId ?? null,
    placement: { xPercent: 50, yPercent: 50, scalePercent: 25, rotationDeg: 0 },
    touched: false
  });
  zp.activeElementId = newId;
  this.cdr.detectChanges();
  this.autoSave();
}

removeElement(elementId: string): void {
  const zp = this.activeZonePlacement;
  if (!zp || zp.elements.length <= 1) return;
  zp.elements = zp.elements.filter(el => el.elementId !== elementId);
  if (zp.activeElementId === elementId) {
    zp.activeElementId = zp.elements[0]?.elementId ?? null;
  }
  this.cdr.detectChanges();
  this.autoSave();
}

setActiveElement(elementId: string): void {
  const zp = this.activeZonePlacement;
  if (!zp) return;
  zp.activeElementId = elementId;
  this.cdr.detectChanges();
}
```

## Modifier `onSnapshotChange`
Mettre à jour l'élément actif (pas la zone entière) :
```typescript
onSnapshotChange(snapshot: PreviewSnapshot): void {
  const el = this.activeElement;
  if (!el) return;
  el.logoId = snapshot.logoId;
  el.placement = { xPercent: snapshot.xPercent, yPercent: snapshot.yPercent, scalePercent: snapshot.scalePercent, rotationDeg: snapshot.rotationDeg };
  el.touched = true;
  const zp = this.activeZonePlacement;
  if (zp) zp.touched = true;
  this.cdr.detectChanges();
  this.autoSave();
}
```

## Modifier `selectLogo`
```typescript
selectLogo(logoId: number): void {
  const el = this.activeElement;
  if (!el) return;
  el.logoId = logoId;
  el.touched = true;
  this.cdr.detectChanges();
  this.autoSave();
}
```

## Changements HTML

Dans le panneau contrôles droite, après le bloc Logo, ajouter la gestion des éléments :

```html
<!-- Éléments superposés -->
<div *ngIf="activeZonePlacement">
  <p class="font-poppins text-xs font-semibold mb-2 uppercase tracking-wide" style="color: var(--c-gray-dark);">Éléments</p>
  <div class="flex flex-wrap gap-2 mb-2">
    <button *ngFor="let el of activeZonePlacement?.elements; let i = index"
            (click)="setActiveElement(el.elementId)"
            class="flex items-center gap-1 px-3 py-1.5 rounded-xl font-poppins text-xs font-semibold transition-all border-2"
            [style.border-color]="activeZonePlacement?.activeElementId === el.elementId ? 'var(--c-green-teal)' : 'var(--c-beige)'"
            [style.background-color]="activeZonePlacement?.activeElementId === el.elementId ? '#F0FDF4' : 'var(--c-white)'"
            [style.color]="activeZonePlacement?.activeElementId === el.elementId ? 'var(--c-green-teal)' : 'var(--c-gray-dark)'">
      Élément {{ i + 1 }}
      <span *ngIf="(activeZonePlacement?.elements?.length ?? 0) > 1"
            (click)="$event.stopPropagation(); removeElement(el.elementId)"
            class="ml-1" style="color: #DC2626;">×</span>
    </button>
  </div>
  <button (click)="addElementToZone()"
          class="px-4 py-1.5 rounded-xl font-poppins text-xs font-semibold transition-all hover:opacity-90"
          style="background-color: var(--c-beige); color: var(--c-green-dark);">+ Ajouter un élément</button>
</div>
```

## Notes importantes
- Garder la compatibilité avec les produits sans zones (positionnement libre)
- Le PDF doit rendre tous les éléments superposés dans l'ordre (element[0] en bas, element[n] en haut)
- Style GreenDesk : `--c-green-dark`, `--c-green-teal`, `--c-beige`, `font-poppins`, `font-dosis`
- Ne pas casser les fonctionnalités existantes
- `product-mockup-render` doit afficher tous les éléments de la zone active superposés
