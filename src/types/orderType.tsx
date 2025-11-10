/**
 * Order Management Type Definitions
 * Custom types for orders, order items, and order-related data structures
 * Created for e-commerce order management system
 */

import type { Product } from './productType';

// Order status enumeration
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Payment status enumeration
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Order item interface - represents a product in an order
export interface OrderItem {
  id: string; // Unique item ID within the order
  productId: string; // Reference to the product
  product: Product; // Full product details (snapshot at time of order)
  quantity: number;
  priceAtTime: number; // Price when the order was placed
  totalPrice: number; // quantity * priceAtTime
}

// Shipping address interface
export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

// Order summary interface
export interface OrderSummary {
  subtotal: number; // Sum of all item totals
  tax: number; // Tax amount
  shipping: number; // Shipping cost
  discount: number; // Any discounts applied
  total: number; // Final total amount
}

// Main order interface
export interface Order {
  id: string; // Unique order identifier
  orderNumber: string; // Human-readable order number (e.g., "ORD-2024-001")
  
  // User information
  userId: string; // User who placed the order
  userEmail: string; // Email for confirmation
  
  // Order items
  items: OrderItem[];
  
  // Order totals
  summary: OrderSummary;
  
  // Status tracking
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  
  // Shipping information
  shippingAddress: ShippingAddress;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  // Additional metadata
  notes?: string; // Customer notes
  trackingNumber?: string; // Shipping tracking
  paymentMethod?: string; // Payment method used
}

// Interface for creating a new order
export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  notes?: string;
}

// Interface for order filters (for order history)
export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
}

// Interface for order list response
export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Interface for order statistics
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByMonth: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
}