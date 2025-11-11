/**
 * Integration Tests for Cart Functionality
 * Tests cart updates when adding products and complete user interaction flows
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductCard from '../ProductCard'
import ShoppingCart from '../ShoppingCart'
import cartSlice, { addToCart, removeFromCart, incrementQuantity, decrementQuantity } from '../../store/cartSlice'
import { useAuth } from '../../hooks/useAuth'
import type { Product } from '../../types/productType'

// Mock the hooks and services
vi.mock('../../hooks/useAuth')
vi.mock('../../services/productService')
vi.mock('../../services/orderService')

// Mock product data for integration testing
const mockProducts: Product[] = [
  {
    id: 'product-1',
    title: 'Wireless Headphones',
    price: 99.99,
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'electronics',
    image: 'https://example.com/headphones.jpg',
    rating: { rate: 4.5, count: 150 },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    isActive: true,
    inventory: {
      stock: 25,
      trackInventory: true
    }
  },
  {
    id: 'product-2',
    title: 'Smart Watch',
    price: 249.99,
    description: 'Feature-rich smartwatch with health monitoring',
    category: 'electronics',
    image: 'https://example.com/watch.jpg',
    rating: { rate: 4.2, count: 89 },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    isActive: true,
    inventory: {
      stock: 15,
      trackInventory: true
    }
  }
]

// Create a real Redux store for integration testing
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartSlice
    },
    preloadedState: {
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isOpen: false,
        ...initialState
      }
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore date objects in actions and state
          ignoredActionPaths: ['payload.product.createdAt', 'payload.product.updatedAt'],
          ignoredStatePaths: ['cart.items.0.product.createdAt', 'cart.items.0.product.updatedAt']
        }
      })
  })
}

// Test wrapper with all necessary providers
const IntegrationTestWrapper = ({ 
  children, 
  store = createTestStore(),
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
}: { 
  children: React.ReactNode
  store?: ReturnType<typeof createTestStore>
  queryClient?: QueryClient
}) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        {children}
      </Provider>
    </QueryClientProvider>
  </BrowserRouter>
)

describe('Cart Integration Tests', () => {
  const mockUseAuth = vi.mocked(useAuth)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { 
        uid: 'test-user', 
        email: 'test@example.com', 
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        addresses: [],
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          theme: 'light' as const,
          language: 'en',
          currency: 'USD'
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true
      },
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      clearError: vi.fn(),
      updateProfile: vi.fn(),
      deleteAccount: vi.fn(),
      refreshProfile: vi.fn()
    })
  })

  describe('Adding Products to Cart', () => {
    it('should update cart state when product is added via ProductCard', async () => {
      const user = userEvent.setup()
      const store = createTestStore()
      
      // Mock onAddToCart function that dispatches to Redux
      const handleAddToCart = (product: Product) => {
        store.dispatch(addToCart({ product }))
      }
      
      render(
        <IntegrationTestWrapper store={store}>
          <ProductCard 
            product={mockProducts[0]} 
            onAddToCart={handleAddToCart}
          />
        </IntegrationTestWrapper>
      )

      // Verify initial cart state is empty
      expect(store.getState().cart.totalItems).toBe(0)
      expect(store.getState().cart.items).toHaveLength(0)

      // Click add to cart button
      const addToCartButton = screen.getByText('🛒 Add to Cart')
      await user.click(addToCartButton)

      // Verify cart state was updated
      const cartState = store.getState().cart
      expect(cartState.totalItems).toBe(1)
      expect(cartState.items).toHaveLength(1)
      expect(cartState.items[0].product.id).toBe(mockProducts[0].id)
      expect(cartState.items[0].quantity).toBe(1)
      expect(cartState.totalPrice).toBe(mockProducts[0].price)
    })

    it('should handle multiple products being added to cart', async () => {
      const user = userEvent.setup()
      const store = createTestStore()
      
      const handleAddToCart = (product: Product) => {
        store.dispatch(addToCart({ product }))
      }
      
      render(
        <IntegrationTestWrapper store={store}>
          <div>
            <ProductCard 
              product={mockProducts[0]} 
              onAddToCart={handleAddToCart}
            />
            <ProductCard 
              product={mockProducts[1]} 
              onAddToCart={handleAddToCart}
            />
          </div>
        </IntegrationTestWrapper>
      )

      // Add first product
      const firstAddButton = screen.getAllByText('🛒 Add to Cart')[0]
      await user.click(firstAddButton)

      // Add second product
      const secondAddButton = screen.getAllByText('🛒 Add to Cart')[1]
      await user.click(secondAddButton)

      // Verify cart contains both products
      const cartState = store.getState().cart
      expect(cartState.totalItems).toBe(2)
      expect(cartState.items).toHaveLength(2)
      expect(cartState.totalPrice).toBe(mockProducts[0].price + mockProducts[1].price)
    })

    it('should increment quantity when same product is added multiple times', async () => {
      const user = userEvent.setup()
      const store = createTestStore()
      
      const handleAddToCart = (product: Product) => {
        store.dispatch(addToCart({ product }))
      }
      
      render(
        <IntegrationTestWrapper store={store}>
          <ProductCard 
            product={mockProducts[0]} 
            onAddToCart={handleAddToCart}
          />
        </IntegrationTestWrapper>
      )

      const addToCartButton = screen.getByText('🛒 Add to Cart')
      
      // Add same product twice
      await user.click(addToCartButton)
      await user.click(addToCartButton)

      // Verify quantity increased instead of adding duplicate
      const cartState = store.getState().cart
      expect(cartState.totalItems).toBe(2)
      expect(cartState.items).toHaveLength(1) // Still only one unique product
      expect(cartState.items[0].quantity).toBe(2)
      expect(cartState.totalPrice).toBe(mockProducts[0].price * 2)
    })
  })

  describe('Full Cart Interaction Flow', () => {
    it('should complete full add-to-cart and cart management flow', async () => {
      const user = userEvent.setup()
      const store = createTestStore()
      
      const handleAddToCart = (product: Product) => {
        store.dispatch(addToCart({ product }))
      }
      
      render(
        <IntegrationTestWrapper store={store}>
          <div>
            <ProductCard 
              product={mockProducts[0]} 
              onAddToCart={handleAddToCart}
            />
            <ShoppingCart />
          </div>
        </IntegrationTestWrapper>
      )

      // Step 1: Add product to cart
      const addToCartButton = screen.getByText('🛒 Add to Cart')
      await user.click(addToCartButton)

      // Step 2: Verify cart badge updates
      let cartState = store.getState().cart
      expect(cartState.totalItems).toBe(1)

      // Step 3: Open cart
      store.dispatch({ type: 'cart/toggleCart' })
      
      await waitFor(() => {
        expect(screen.getByText('🛒 Shopping Cart')).toBeInTheDocument()
      })

      // Step 4: Verify product appears in cart
      expect(screen.getByText(mockProducts[0].title.substring(0, 20))).toBeInTheDocument()
      expect(screen.getByText(`$${mockProducts[0].price.toFixed(2)} each`)).toBeInTheDocument()

      // Step 5: Test quantity increment
      const incrementButton = screen.getByText('+')
      await user.click(incrementButton)

      cartState = store.getState().cart
      expect(cartState.totalItems).toBe(2)
      expect(cartState.items[0].quantity).toBe(2)

      // Step 6: Test quantity decrement
      const decrementButton = screen.getByText('-')
      await user.click(decrementButton)

      cartState = store.getState().cart
      expect(cartState.totalItems).toBe(1)
      expect(cartState.items[0].quantity).toBe(1)

      // Step 7: Test remove item
      const removeButton = screen.getByText('✕')
      await user.click(removeButton)

      cartState = store.getState().cart
      expect(cartState.totalItems).toBe(0)
      expect(cartState.items).toHaveLength(0)
    })

    it('should handle cart persistence and state management correctly', () => {
      // Test Redux actions directly for deterministic behavior
      const store = createTestStore()
      
      // Add multiple products
      store.dispatch(addToCart({ product: mockProducts[0] }))
      store.dispatch(addToCart({ product: mockProducts[1] }))
      store.dispatch(addToCart({ product: mockProducts[0] })) // Should increment quantity
      
      let state = store.getState().cart
      expect(state.items).toHaveLength(2) // Two unique products
      expect(state.totalItems).toBe(3) // Total quantity
      
      // Test increment
      store.dispatch(incrementQuantity(mockProducts[0].id))
      state = store.getState().cart
      expect(state.totalItems).toBe(4)
      
      // Test decrement
      store.dispatch(decrementQuantity(mockProducts[0].id))
      state = store.getState().cart
      expect(state.totalItems).toBe(3)
      
      // Test remove
      store.dispatch(removeFromCart(mockProducts[0].id))
      state = store.getState().cart
      expect(state.totalItems).toBe(1)
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe(mockProducts[1].id)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle adding product with zero stock gracefully', async () => {
      const store = createTestStore()
      
      const outOfStockProduct: Product = {
        ...mockProducts[0],
        inventory: { stock: 0, trackInventory: true }
      }
      
      const handleAddToCart = (product: Product) => {
        // Should not add if out of stock
        if (product.inventory.stock > 0) {
          store.dispatch(addToCart({ product }))
        }
      }
      
      render(
        <IntegrationTestWrapper store={store}>
          <ProductCard 
            product={outOfStockProduct} 
            onAddToCart={handleAddToCart}
          />
        </IntegrationTestWrapper>
      )

      // Product should show as out of stock
      expect(screen.getByText('❌ Out of stock')).toBeInTheDocument()
      
      // Cart should remain empty when trying to add out of stock product
      const cartState = store.getState().cart
      expect(cartState.totalItems).toBe(0)
    })

    it('should maintain cart state integrity across multiple operations', async () => {
      const store = createTestStore()
      
      // Perform multiple rapid operations
      const operations = [
        () => store.dispatch(addToCart({ product: mockProducts[0] })),
        () => store.dispatch(addToCart({ product: mockProducts[1] })),
        () => store.dispatch(incrementQuantity(mockProducts[0].id)),
        () => store.dispatch(incrementQuantity(mockProducts[0].id)),
        () => store.dispatch(decrementQuantity(mockProducts[1].id)),
        () => store.dispatch(addToCart({ product: mockProducts[0] }))
      ]
      
      operations.forEach(op => op())
      
      const finalState = store.getState().cart
      expect(finalState.items).toHaveLength(2)
      
      // Verify totals are calculated correctly
      const expectedTotal = finalState.items.reduce(
        (sum, item) => sum + (item.product.price * item.quantity), 
        0
      )
      expect(finalState.totalPrice).toBe(expectedTotal)
      
      const expectedTotalItems = finalState.items.reduce(
        (sum, item) => sum + item.quantity, 
        0
      )
      expect(finalState.totalItems).toBe(expectedTotalItems)
    })
  })
})