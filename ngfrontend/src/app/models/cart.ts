export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  sessionId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}
