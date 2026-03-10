import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart, CartItem } from '../models/cart';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  // BehaviorSubject pour que tous les composants voient le panier en temps réel
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart(); // charge le panier au démarrage
  }

  // Génère ou récupère le sessionId depuis localStorage
  getSessionId(): string {
    let sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
  }

  private loadCart(): void {
    this.getCart().subscribe();
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/${this.getSessionId()}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addItem(productId: number, quantity: number = 1): Observable<Cart> {
    const params = new HttpParams()
      .set('productId', productId)
      .set('quantity', quantity);
    return this.http.post<Cart>(`${this.apiUrl}/${this.getSessionId()}/add`, null, { params }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    const params = new HttpParams().set('quantity', quantity);
    return this.http.put<Cart>(`${this.apiUrl}/${this.getSessionId()}/item/${itemId}`, null, { params }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/${this.getSessionId()}/item/${itemId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.getSessionId()}`).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  // Nombre total d'articles pour le badge dans la navbar
  getItemCount(): number {
    return this.cartSubject.value?.itemCount ?? 0;
  }
}
