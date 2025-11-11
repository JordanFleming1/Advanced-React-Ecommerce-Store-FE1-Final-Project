/**
 * Unit Tests for ProductCard Component
 * Tests rendering, state changes, and user interactions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ProductCard from '../ProductCard'
import { useAuth } from '../../hooks/useAuth'
import { deleteProduct, updateProduct } from '../../services/productService'
import type { Product } from '../../types/productType'

// Mock the hooks and services
vi.mock('../../hooks/useAuth')
vi.mock('../../services/productService')

// Mock data
const mockProduct: Product = {
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
  }
}

// Mock Redux store
const createMockStore = () => {
  return configureStore({
    reducer: {
      cart: (state = { items: [], totalItems: 0, totalPrice: 0, isOpen: false }) => state
    }
  })
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createMockStore()
  return <Provider store={store}>{children}</Provider>
}

describe('ProductCard Component', () => {
  const mockOnAddToCart = vi.fn()
  const mockOnProductUpdated = vi.fn()
  const mockUseAuth = vi.mocked(useAuth)
  const mockDeleteProduct = vi.mocked(deleteProduct)
  const mockUpdateProduct = vi.mocked(updateProduct)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { 
        uid: 'test-user', 
        email: 'test@example.com', 
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        addresses: [],
        preferences: { 
          theme: 'light', 
          emailNotifications: true, 
          smsNotifications: true,
          marketingEmails: false,
          currency: 'USD', 
          language: 'en' 
        },
        createdAt: new Date(),
        updatedAt: new Date(),
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

  describe('Component Rendering', () => {
    it('should render product information correctly', () => {
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      // Assert product details are displayed
      expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
      expect(screen.getByText(`$${mockProduct.price.toFixed(2)}`)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
      expect(screen.getByText(/⭐ 4\.5/)).toBeInTheDocument()
      expect(screen.getByText('10 in stock')).toBeInTheDocument()
    })

    it('should render product image with correct src', () => {
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      const image = screen.getByAltText(mockProduct.title) as HTMLImageElement
      expect(image).toBeInTheDocument()
      expect(image.src).toBe(mockProduct.image)
    })

    it('should show admin controls when user is authenticated', () => {
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('should hide admin controls when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
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

      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    })
  })

  describe('State Changes and User Interactions', () => {
    it('should handle add to cart button click', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      const addToCartButton = screen.getByText('Add to Cart')
      await user.click(addToCartButton)

      expect(mockOnAddToCart).toHaveBeenCalledTimes(1)
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct)
    })

    it('should show fallback image on image load error', () => {
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      const image = screen.getByAltText(mockProduct.title) as HTMLImageElement
      
      // Simulate image load error
      fireEvent.error(image)

      // Check if the image src changes to fallback
      expect(image.src).toContain('placeholder.com')
      expect(image.src).toContain(encodeURIComponent(mockProduct.category))
    })

    it('should open edit modal when edit button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(screen.getByText('Edit Product: Test Product')).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockProduct.title)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockProduct.price.toString())).toBeInTheDocument()
    })

    it('should open delete modal when delete button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete this product?')).toBeInTheDocument()
    })

    it('should update product when edit form is submitted', async () => {
      const user = userEvent.setup()
      mockUpdateProduct.mockResolvedValue(mockProduct)
      
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      // Open edit modal
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      // Change title
      const titleInput = screen.getByDisplayValue(mockProduct.title)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Product Title')

      // Submit form
      const saveButton = screen.getByText('Update Product')
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateProduct).toHaveBeenCalledTimes(1)
        expect(mockUpdateProduct).toHaveBeenCalledWith(
          mockProduct.id,
          expect.objectContaining({
            title: 'Updated Product Title'
          })
        )
      })
    })

    it('should delete product when delete is confirmed', async () => {
      const user = userEvent.setup()
      mockDeleteProduct.mockResolvedValue(undefined)
      
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      // Open delete modal
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      // Confirm deletion
      const confirmButton = screen.getByText('Delete Product')
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteProduct).toHaveBeenCalledTimes(1)
        expect(mockDeleteProduct).toHaveBeenCalledWith(mockProduct.id)
      })
    })

    it('should handle form validation errors', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <ProductCard 
            product={mockProduct} 
            onAddToCart={mockOnAddToCart}
            onProductUpdated={mockOnProductUpdated}
          />
        </TestWrapper>
      )

      // Open edit modal
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      // Clear required fields
      const titleInput = screen.getByDisplayValue(mockProduct.title)
      await user.clear(titleInput)

      // Submit form
      const saveButton = screen.getByText('Update Product')
      await user.click(saveButton)

      // Should not call update service with empty title
      expect(mockUpdateProduct).not.toHaveBeenCalled()
    })
  })
})