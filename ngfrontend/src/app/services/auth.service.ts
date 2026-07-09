import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
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
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
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
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<UserProfile>(`${this.apiUrl}/auth/me`, { headers }).subscribe({
      next: user => this.currentUserSubject.next(user),
      error: () => localStorage.removeItem(this.TOKEN_KEY)
    });
  }
}
