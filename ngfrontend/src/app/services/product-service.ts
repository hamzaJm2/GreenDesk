import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import {environment} from '../environments/environment';
import {ProductTabDefinition} from '../models/productTabDefinition';
import {ProductVariant} from '../models/productVariant';



@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Remplacez cette URL par votre endpoint réel
  private apiUrl =  `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  // Récupérer tous les produits
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }


  getProductTabs(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/tabs`);
  }

  // Charge les onglets disponibles (ProductTabDefinition)
  getTabDefinitions(): Observable<ProductTabDefinition[]> {
    return this.http.get<ProductTabDefinition[]>(`${this.apiUrl}/tab-definitions`);
  }

  // ── Variantes ──────────────────────────────────────────────────────────────
  toggleVariant(productId: number, variantId: number): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(
      `${this.apiUrl}/${productId}/variants/${variantId}/toggle`,
      null
    );
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

