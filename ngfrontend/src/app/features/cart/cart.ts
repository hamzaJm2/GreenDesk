import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { Cart, CartItem } from '../../models/cart';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent implements OnInit {

  cart: Cart | null = null;
  isLoading = true;
  errorMessage = '';
  uploadsUrl = environment.uploadsUrl;  // ← corrigé

  constructor(
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef   // ← injecté proprement, plus optionnel
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isLoading = false;
        this.cdr.detectChanges();  // ← fonctionne maintenant
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le panier.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });


  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) return;
    this.cartService.updateItem(item.id, newQuantity).subscribe({
      next: () => this.cdr.detectChanges()
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      next: () => this.cdr.detectChanges()
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => this.cdr.detectChanges()
    });
  }

  continueShopping(): void {
    this.router.navigate(['/boutique']);
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }

  onImageError(event: any, imagePath: string): void {
    console.error('❌ Image non trouvée:', this.uploadsUrl + '/' + imagePath);
    event.target.src = 'assets/images/placeholder.png'; // image de remplacement
  }
}
