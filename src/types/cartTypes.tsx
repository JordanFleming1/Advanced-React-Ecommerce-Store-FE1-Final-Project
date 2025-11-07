import type { Product } from './productType';

// Interface for a cart item (extends Product with quantity)
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

// Interface for the entire cart state
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean; // For cart sidebar/modal
}

// Interface for adding items to cart
export interface AddToCartPayload {
  product: Product;
  quantity?: number; // Optional, defaults to 1
}

// Interface for updating cart item quantity
export interface UpdateCartItemPayload {
  productId: number;
  quantity: number;
}