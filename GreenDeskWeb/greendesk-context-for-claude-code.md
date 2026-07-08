# GreenDesk — Contexte projet pour Claude Code

## Stack technique
- **Frontend** : Angular 21, Tailwind CSS, Tabler Icons (CDN), jsPDF
- **Backend** : Spring Boot / Java, MySQL (`greendeskdb`), JPA/Hibernate
- **URLs** : Frontend `localhost:4200`, Backend `localhost:8080`
- **Style** : CSS variables `--c-green-dark`, `--c-green-teal`, `--c-gold`, `--c-beige`, fonts `font-dosis`, `font-poppins`

## Architecture fichiers clés
```
src/app/
├── admin/
│   ├── admin-dashboard/
│   ├── admin-produits/                    # liste produits
│   ├── admin-produit-params/              # 4 étapes params maquettes
│   └── admin-icones/                      # règles mots-clés → icônes Tabler
├── features/
│   ├── nouvelles-maquettes-component/     # wizard 4 étapes maquettes
│   ├── product-logo-preview/              # wrapper preview avec zones
│   └── product-mockup-render/             # rendu canvas + interactions
├── services/
│   ├── pdf-generation-service.ts          # génération PDF jsPDF
│   ├── mockup-service.ts
│   ├── product-service.ts
│   └── color-detection-service.ts
└── models/
    ├── mockup.ts
    ├── product.ts
    └── placement.ts

Backend:
src/main/java/com/example/GreenDeskWeb/
├── entites/
│   ├── Product.java                       # +labelType, strengthItems, markingZones, coloris
│   ├── ProductStrength.java               # id, titre, phrase, iconId, displayOrder
│   ├── ProductMarkingZone.java            # id, nom, masquePng, paddingPercent, zoomActive
│   ├── ProductColoris.java                # id, nom, codeHex, imageProduit, actif
│   └── IconRule.java                      # id, label, iconId, keywords[]
├── dto/
│   ├── ProductDTO.java
│   ├── ProductStrengthDTO.java
│   ├── ProductMarkingZoneDTO.java
│   └── ProductColorisDTO.java
├── controllers/
│   ├── ProductController.java
│   ├── UploadController.java              # /uploads/product/coloris + /uploads/product/masque
│   └── IconRuleController.java
├── services/ProductService/
│   ├── ProductServiceImpl.java            # updateProduct() avec diff coloris/zones/strengths
│   └── FileSystemStorageServiceImpl.java
└── config/
    └── WebConfig.java                     # handlers /media/**, /products/**, /mockups/**
```

## BDD — État actuel
- 14 produits : Flexy(1), Aqaba(2), Moka(3), Maggy(4), MegaPop(5), Noody(6), Ostral(7), FloPop(8), KeyPop(9), Lizia(10), PopNote(11), SafeUp(12), WarmUp(13), WattsUp(14)
- `strengthItems` : insérés pour tous les produits
- `labelType` : FIF par défaut, OFG pour ids 3,5,6,7,8,9,11,12
- Coloris Aqaba : bouton bleu + bouton rouge (path `media/products/Aqaba/coloris/...`)
- Zone marquage Aqaba : Recto (masquePng configuré)
- Images coloris anciens (Flexy, Moka...) : path `products/{nom}/...` via handler `/products/**`
- Images coloris nouveaux (Aqaba) : path `media/products/...` via handler `/media/**`

## Logique métier clé

### Wizard maquettes (4 étapes)
1. **Logos** — upload, détection couleurs k-means
2. **Produits** — sélection coloris par produit
3. **Personnalisation** — placement logo drag/resize/rotate, zones de marquage, variantes, sauvegarde auto
4. **Génération PDF** — jsPDF A4 landscape, page de garde + 1 page par produit/coloris/variante

### Placement logo
- `xPercent`, `yPercent` = position centre logo en % du stage
- `scalePercent` = largeur logo en % du stage
- `rotationDeg` = rotation en degrés
- Auto-placement depuis masque : canvas lit pixels alpha → extrait bounding box → calcule placement centré

### Clipping masque (EN COURS — BUGUÉ)
- Technique : CSS `mask-image` avec variable CSS `--mask-url`
- Masque PNG requis : **fond transparent + zone blanche opaque** (même dimensions que image produit)
- Actuellement appliqué sur `.mockup-zone` → doit être déplacé sur `.mockup-logo-clip-layer` avec classe `is-masked`
- Le masque est passé via `[style]="zoneStyle"` où `zoneStyle = { '--mask-url': 'url("...")' }`

### PDF generation
- Points forts : utilise `strengthItems` (titre+phrase) si disponibles, sinon fallback `strengths` legacy
- Label : `labelType === 'OFG'` → `label-origine-france.png`, `'FIF'` → `label-fab-france.png`, `'NONE'` → rien
- Assets PDF : `public/pdf-assets/` (greendesk-logo.png, leaves-top-right.png, leaves-bottom-left.png, label-fab-france.png, label-origine-france.png)

### Recoloration images
- Mode `keep-white` : garde pixels brightness > 0.85, recolorie le reste
- Mode `full` : recolorie tout (utilisé pour Moka)

## Tâches restantes

### Priorité haute
1. **Fix clipping masque** — déplacer CSS mask de `.mockup-zone` vers `.mockup-logo-clip-layer.is-masked`
2. **Bouton retour accueil** dans admin-produit-params (en bas de page)
3. **Pastille tricolore** pour coloris Flexy tricolore (gradient bleu-blanc-rouge au lieu du codeHex)

### Priorité moyenne
4. **Taille logo en mm** — ajouter `largeurZoneMm`/`hauteurZoneMm` dans `ProductMarkingZone`, calculer et afficher dans étape 3
5. **Icônes dans PDF** — actuellement cercles verts, idéalement rasteriser les icônes Tabler en PNG
6. **Multi-éléments superposés** — plusieurs logos/photos sur une même zone

### Priorité basse (après démo)
7. **Multi-zones simultanées** — recto + verso + bouchon actifs en même temps
8. **Authentification** — espaces admin/client séparés avec historique
9. **Emballages SVG** — paramétrage et affichage dans maquettes
10. **Faces côte à côte PDF** — tasse 4 faces, gourde recto/verso/bouchon

## Bugs connus
- Clipping masque : `mask-image` appliqué au mauvais niveau du DOM
- Images coloris dans admin : upload fonctionne (200 OK) mais preview cassée si path `products/...` au lieu de `media/products/...`
- Auto-positionnement logo : 50/50 par défaut si masque mal chargé

## Notes importantes
- Angular filtre les propriétés CSS préfixées via `[style.xxx]` — utiliser CSS variables `--mask-url` via `[style]` à la place
- `FileSystemStorageServiceImpl` stocke dans `./uploads/` relatif au `user.dir`
- Nouveaux uploads coloris/masques → path `media/products/...`, anciens → `products/...`
- `CartServiceImpl.getCart()` ne doit pas avoir `@Transactional(readOnly = true)` — bug corrigé
