import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, filter, finalize, take, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface UserProfile {
  email: string;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'CLIENT';
}

interface AuthResponse {
  token: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  message: string;
  statutCompte: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'greendesk_jwt';
  private readonly apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Devient true une fois que la restauration de session au démarrage (loadUserFromToken)
  // a abouti (succès ou échec) : les guards attendent ce signal pour ne pas rediriger
  // vers /login pendant que l'appel /auth/me est encore en vol après un F5.
  private authReadySubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  waitUntilReady(): Observable<boolean> {
    return this.authReadySubject.pipe(filter(ready => ready), take(1));
  }

  register(
    email: string, password: string, nom: string, prenom: string,
    societe: string, siret: string
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/register`,
      { email, password, nom, prenom, societe, siret }
    );
    // PAS de tap() — pas de token stocké, compte en attente
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.currentUserSubject.next({
          email: res.email,
          nom: res.nom,
          prenom: res.prenom,
          role: res.role as 'ADMIN' | 'CLIENT'
        });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    // Vérifie d'abord le subject en mémoire
    if (this.currentUserSubject.value?.role === 'ADMIN') return true;

    // Sinon parse le token JWT pour obtenir le rôle
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'ADMIN' || payload.authorities?.includes('ROLE_ADMIN');
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token) {
      this.authReadySubject.next(true);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<UserProfile>(`${this.apiUrl}/auth/me`, { headers }).pipe(
      finalize(() => this.authReadySubject.next(true))
    ).subscribe({
      next: user => this.currentUserSubject.next(user),
      error: () => localStorage.removeItem(this.TOKEN_KEY)
    });
  }
}
