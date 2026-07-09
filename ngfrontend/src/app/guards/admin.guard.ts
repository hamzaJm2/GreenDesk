import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si déjà chargé
  if (authService.isAdmin()) return true;
  if (!authService.isLoggedIn()) return router.createUrlTree(['/login']);

  // Attendre le chargement async du user
  return authService.currentUser$.pipe(
    filter(user => user !== null),
    take(1),
    map(user => {
      if (user?.role === 'ADMIN') return true;
      return router.createUrlTree(['/']);
    })
  );
};
