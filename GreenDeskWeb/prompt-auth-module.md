# GreenDesk — Module Authentification

## Contexte
Application BtoB Angular 21 + Spring Boot/MySQL. On veut ajouter un système d'authentification avec deux rôles : ADMIN et CLIENT.

## Stack existante
- Frontend : Angular 21, standalone components, Tailwind CSS
- Backend : Spring Boot, JPA/Hibernate, MySQL (`greendeskdb`)
- Pas de Spring Security encore

## Ce qu'on veut implémenter

### Backend Spring Boot
1. Entité `User` : id, email, password (bcrypt), role (ADMIN/CLIENT), nom, prénom, actif
2. Spring Security avec JWT tokens
3. Endpoints :
   - `POST /auth/login` → retourne JWT
   - `POST /auth/register` → inscription client
   - `GET /auth/me` → profil utilisateur connecté
4. Sécuriser les routes :
   - `/admin/**` → ADMIN seulement
   - `/api/maquettes/**` → ADMIN + CLIENT connecté
   - `/products/**`, `/categories/**` → public
5. `MockupProject` doit avoir une référence vers `User` (chaque maquette appartient à un user)

### Frontend Angular
1. Service `AuthService` avec :
   - `login(email, password)` → stocke JWT dans localStorage
   - `logout()` → clear token
   - `currentUser$` Observable
   - `isAdmin()`, `isLoggedIn()`
2. `AuthGuard` pour protéger les routes `/admin/**` et `/maquettes/**`
3. Page de login `/login` (design cohérent avec le reste — variables CSS GreenDesk)
4. Header : afficher nom utilisateur + bouton déconnexion quand connecté
5. Intercepteur HTTP pour ajouter le JWT dans les headers

### Espaces séparés
- **Admin** : accès à tout + historique toutes les maquettes clients
- **Client** : accès à ses maquettes uniquement + nouvelle maquette

## Style GreenDesk
Variables CSS : `--c-green-dark`, `--c-green-teal`, `--c-gold`, `--c-beige`, `--c-white`
Fonts : `font-dosis` (titres), `font-poppins` (texte)
Composants : rounded-2xl, shadow-sm, border-2

## Fichiers de contexte
Lire `greendesk-context-for-claude-code.md` pour comprendre l'architecture complète avant de commencer.

## Ordre d'implémentation suggéré
1. Backend : entité User + Spring Security + JWT
2. Backend : sécuriser les routes + lier MockupProject à User
3. Frontend : AuthService + intercepteur + AuthGuard
4. Frontend : page login + header mis à jour
5. Frontend : page "Mes maquettes" filtrée par user
6. Frontend : admin — historique toutes les maquettes
