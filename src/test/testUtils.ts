/**
 * Test Utilities
 * Helper functions and mock data for testing components
 */
import { configureStore } from '@reduxjs/toolkit'
import { vi, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import cartSlice from '../store/cartSlice'
import type { Product } from '../types/productType'

// Mock product data for testing
export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'test-product-1',
  title: 'Test Product',
  price: 29.99,
  description: 'A test product for unit testing',
  category: 'electronics',
  image: 'https://example.com/test-image.jpg',
  rating: { rate: 4.5, count: 100 },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  isActive: true,
  inventory: {
    stock: 10,
    trackInventory: true
  },
  ...overrides
})

// Mock user data
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  ...overrides
})

// Create test store helper
export const createTestStore = (initialState = {}) => {
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
          ignoredActionPaths: ['payload.product.createdAt', 'payload.product.updatedAt'],
          ignoredStatePaths: ['cart.items.0.product.createdAt', 'cart.items.0.product.updatedAt']
        }
      })
  })
}

// Mock auth hook return values
export const createMockAuthReturn = (overrides = {}) => ({
  isAuthenticated: true,
  user: createMockUser(),
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  clearError: vi.fn(),
  updateProfile: vi.fn(),
  deleteAccount: vi.fn(),
  refreshProfile: vi.fn(),
  ...overrides
})

// Test assertions helpers
export const expectToBeInDocument = (text: string) => {
  return expect(screen.getByText(text)).toBeInTheDocument()
}

export const expectNotToBeInDocument = (text: string) => {
  return expect(screen.queryByText(text)).not.toBeInTheDocument()
}

// Async test helpers
export const waitForElementToAppear = async (text: string) => {
  return await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument()
  })
}

export const waitForElementToDisappear = async (text: string) => {
  return await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument()
  })
}

// Cart test helpers
export const getCartState = (store: ReturnType<typeof createTestStore>) => {
  return store.getState().cart
}

export const expectCartToHaveItems = (
  store: ReturnType<typeof createTestStore>, 
  expectedCount: number
) => {
  const cartState = getCartState(store)
  expect(cartState.totalItems).toBe(expectedCount)
  expect(cartState.items).toHaveLength(expectedCount > 0 ? 1 : 0)
}

// Form testing helpers
export const fillForm = async (formData: Record<string, string>) => {
  const user = userEvent.setup()
  
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
    await user.clear(field)
    await user.type(field, value)
  }
  
  return user
}

export const submitForm = async (buttonText = /submit|save|sign in/i) => {
  const user = userEvent.setup()
  const submitButton = screen.getByRole('button', { name: buttonText })
  await user.click(submitButton)
  return user
}

// Error testing helpers
export const expectErrorMessage = (message: string) => {
  return expect(screen.getByText(message)).toBeInTheDocument()
}

export const expectNoErrorMessage = () => {
  const errorElements = screen.queryAllByRole('alert')
  expect(errorElements).toHaveLength(0)
}

// Loading state helpers
export const expectLoadingState = (text = /loading|signing in|updating/i) => {
  return expect(screen.getByText(text)).toBeInTheDocument()
}

export const expectNotLoadingState = (text = /loading|signing in|updating/i) => {
  return expect(screen.queryByText(text)).not.toBeInTheDocument()
}