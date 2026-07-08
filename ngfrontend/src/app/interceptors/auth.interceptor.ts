import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip auth header for login/register — the token doesn't exist yet
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  const token = authService.getToken();

  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 && !isAuthEndpoint) {
        authService.logout();
      }
      return throwError(() => err);
    })
  );
};
