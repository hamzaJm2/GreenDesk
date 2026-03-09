import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl =  `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  // Récupérer tous les produits
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getProductTabs(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tabs/${productId}`);
  }

}

