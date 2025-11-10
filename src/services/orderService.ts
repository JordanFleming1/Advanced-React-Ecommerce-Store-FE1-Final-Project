/**
 * Order Management Service
 * Custom Firebase Firestore operations for comprehensive order management
 * Handles order creation, retrieval, and management functionality
 */

import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { auth, db } from "../firebase/index";
import { getProductById } from "./productService";
import type { 
  Order, 
  OrderItem, 
  CreateOrderData, 
  OrderFilters, 
  OrdersResponse,
  OrderSummary,
  OrderStatus,
  PaymentStatus
} from "../types/orderType";

/**
 * Generate a unique order number
 */
const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Calculate order summary (totals, tax, shipping)
 */
const calculateOrderSummary = (items: OrderItem[]): OrderSummary => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.08; // 8% tax rate
  const tax = subtotal * taxRate;
  
  // Simple shipping calculation
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  
  const discount = 0; // No discounts for now
  const total = subtotal + tax + shipping - discount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

/**
 * Create a new order from cart data
 */
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to create orders");
    }

    console.log("Creating order for user:", user.uid);
    console.log("Order data:", orderData);

    // Validate that we have items
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    // Fetch current product data for each item
    const orderItems: OrderItem[] = [];
    
    for (const item of orderData.items) {
      const product = await getProductById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      
      // Check stock availability
      if (product.inventory.trackInventory && product.inventory.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}. Available: ${product.inventory.stock}, Requested: ${item.quantity}`);
      }
      
      const orderItem: OrderItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        product: product, // Snapshot of product at time of order
        quantity: item.quantity,
        priceAtTime: product.price,
        totalPrice: Math.round(product.price * item.quantity * 100) / 100
      };
      
      orderItems.push(orderItem);
    }

    // Calculate totals
    const summary = calculateOrderSummary(orderItems);
    
    // Generate order number and ID
    const orderNumber = generateOrderNumber();
    const orderRef = doc(collection(db, "orders"));
    
    // Create order object
    const order: Omit<Order, 'id'> = {
      orderNumber,
      userId: user.uid,
      userEmail: user.email || '',
      items: orderItems,
      summary,
      status: 'pending' as OrderStatus,
      paymentStatus: 'pending' as PaymentStatus,
      shippingAddress: orderData.shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes
    };

    console.log("Prepared order object:", order);

    // Save order to Firestore
    await setDoc(orderRef, {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log("Order saved to Firestore with ID:", orderRef.id);

    // Update product stock (if tracking inventory)
    const batch = writeBatch(db);
    for (const item of orderItems) {
      if (item.product.inventory.trackInventory) {
        const productRef = doc(db, "products", item.productId);
        const newStock = item.product.inventory.stock - item.quantity;
        batch.update(productRef, {
          "inventory.stock": newStock,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // Commit stock updates
    await batch.commit();
    console.log("Product stock updated successfully");

    return {
      id: orderRef.id,
      ...order
    };
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
    throw new Error("Failed to create order: Unknown error");
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    
    if (orderDoc.exists()) {
      const data = orderDoc.data();
      return {
        id: orderDoc.id,
        orderNumber: data.orderNumber,
        userId: data.userId,
        userEmail: data.userEmail,
        items: data.items,
        summary: data.summary,
        status: data.status,
        paymentStatus: data.paymentStatus,
        shippingAddress: data.shippingAddress,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        shippedAt: data.shippedAt?.toDate(),
        deliveredAt: data.deliveredAt?.toDate(),
        notes: data.notes,
        trackingNumber: data.trackingNumber,
        paymentMethod: data.paymentMethod
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error("Failed to fetch order");
  }
};

/**
 * Get orders for current user
 */
export const getUserOrders = async (
  filters: OrderFilters = {},
  pageSize: number = 20
): Promise<OrdersResponse> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to view orders");
    }

    // Build query constraints
    const constraints: Parameters<typeof query>[1][] = [
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(pageSize + 1) // Get one extra to check if there are more
    ];

    // Add status filter if specified
    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }

    // Create and execute query
    const ordersQuery = query(collection(db, "orders"), ...constraints);
    const querySnapshot = await getDocs(ordersQuery);
    
    const orders: Order[] = [];
    let hasMore = false;
    
    querySnapshot.docs.forEach((doc, index) => {
      if (index < pageSize) {
        const data = doc.data();
        orders.push({
          id: doc.id,
          orderNumber: data.orderNumber,
          userId: data.userId,
          userEmail: data.userEmail,
          items: data.items,
          summary: data.summary,
          status: data.status,
          paymentStatus: data.paymentStatus,
          shippingAddress: data.shippingAddress,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          shippedAt: data.shippedAt?.toDate(),
          deliveredAt: data.deliveredAt?.toDate(),
          notes: data.notes,
          trackingNumber: data.trackingNumber,
          paymentMethod: data.paymentMethod
        });
      } else {
        hasMore = true;
      }
    });

    // Apply client-side filters if needed
    let filteredOrders = orders;
    
    if (filters.startDate || filters.endDate) {
      filteredOrders = orders.filter(order => {
        const orderDate = order.createdAt;
        if (filters.startDate && orderDate < filters.startDate) return false;
        if (filters.endDate && orderDate > filters.endDate) return false;
        return true;
      });
    }
    
    if (filters.minTotal !== undefined) {
      filteredOrders = filteredOrders.filter(order => order.summary.total >= filters.minTotal!);
    }
    
    if (filters.maxTotal !== undefined) {
      filteredOrders = filteredOrders.filter(order => order.summary.total <= filters.maxTotal!);
    }

    return {
      orders: filteredOrders,
      total: filteredOrders.length,
      page: 0,
      limit: pageSize,
      hasMore
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new Error("Failed to fetch orders");
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus,
  trackingNumber?: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to update orders");
    }

    const orderRef = doc(db, "orders", orderId);
    const updates: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'shipped' && trackingNumber) {
      updates.trackingNumber = trackingNumber;
      updates.shippedAt = serverTimestamp();
    }

    if (status === 'delivered') {
      updates.deliveredAt = serverTimestamp();
    }

    await setDoc(orderRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Failed to update order status");
  }
};

/**
 * Cancel an order (only if pending)
 */
export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to cancel orders");
    }

    // First, get the order to check if it can be cancelled
    const order = await getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== user.uid) {
      throw new Error("You can only cancel your own orders");
    }

    if (order.status !== 'pending') {
      throw new Error("Only pending orders can be cancelled");
    }

    // Update order status
    await updateOrderStatus(orderId, 'cancelled');

    // Restore product stock if inventory was tracked
    const batch = writeBatch(db);
    for (const item of order.items) {
      if (item.product.inventory.trackInventory) {
        const productRef = doc(db, "products", item.productId);
        const restoredStock = item.product.inventory.stock + item.quantity;
        batch.update(productRef, {
          "inventory.stock": restoredStock,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    await batch.commit();
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw new Error("Failed to cancel order");
  }
};