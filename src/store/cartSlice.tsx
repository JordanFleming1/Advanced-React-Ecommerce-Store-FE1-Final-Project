import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartState, CartItem, AddToCartPayload, UpdateCartItemPayload } from '../types/cartTypes';

// SessionStorage key for cart data
const CART_STORAGE_KEY = 'ecommerce-cart';

// Helper function to load cart from sessionStorage
const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = sessionStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // Recalculate totals to ensure consistency
      const totals = calculateTotals(parsedCart.items || []);
      return {
        ...parsedCart,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
        isOpen: false, // Always start with cart closed
      };
    }
  } catch (error) {
    console.error('Error loading cart from sessionStorage:', error);
  }
  return {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isOpen: false,
  };
};

// Helper function to save cart to sessionStorage
const saveCartToStorage = (state: CartState) => {
  try {
    // Don't save the isOpen state to storage
    const cartToSave = {
      items: state.items,
      totalItems: state.totalItems,
      totalPrice: state.totalPrice,
    };
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartToSave));
  } catch (error) {
    console.error('Error saving cart to sessionStorage:', error);
  }
};

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  return { totalItems, totalPrice };
};

// Initial state for the cart (loaded from sessionStorage)
const initialState: CartState = loadCartFromStorage();

// Create the cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { product, quantity = 1 } = action.payload;
      
      // Check if item already exists in cart
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        // If exists, increase quantity
        existingItem.quantity += quantity;
      } else {
        // If new item, add to cart
        const newItem: CartItem = {
          id: product.id,
          product,
          quantity,
        };
        state.items.push(newItem);
      }
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      
      // Save to sessionStorage
      saveCartToStorage(state);
    },

    // Remove item completely from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      
      // Save to sessionStorage
      saveCartToStorage(state);
    },

    // Update item quantity
    updateCartItemQuantity: (state, action: PayloadAction<UpdateCartItemPayload>) => {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // If quantity is 0 or less, remove item
        state.items = state.items.filter(item => item.id !== productId);
      } else {
        // Update quantity
        const item = state.items.find(item => item.id === productId);
        if (item) {
          item.quantity = quantity;
        }
      }
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      
      // Save to sessionStorage
      saveCartToStorage(state);
    },

    // Increase item quantity by 1
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const item = state.items.find(item => item.id === productId);
      
      if (item) {
        item.quantity += 1;
        
        // Recalculate totals
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        
        // Save to sessionStorage
        saveCartToStorage(state);
      }
    },

    // Decrease item quantity by 1
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const item = state.items.find(item => item.id === productId);
      
      if (item) {
        if (item.quantity <= 1) {
          // Remove if quantity would be 0
          state.items = state.items.filter(i => i.id !== productId);
        } else {
          item.quantity -= 1;
        }
        
        // Recalculate totals
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        
        // Save to sessionStorage
        saveCartToStorage(state);
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      
      // Clear sessionStorage
      saveCartToStorage(state);
    },

    // Toggle cart visibility (for sidebar/modal)
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    // Open cart
    openCart: (state) => {
      state.isOpen = true;
    },

    // Close cart
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;