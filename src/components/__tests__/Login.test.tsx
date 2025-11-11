/**
 * Unit Tests for Login Component  
 * Tests rendering, form validation, and authentication flow
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../Login'
import { useAuth } from '../../hooks/useAuth'

// Mock the useAuth hook
vi.mock('../../hooks/useAuth')

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Login Component', () => {
  const mockLogin = vi.fn()
  const mockUseAuth = vi.mocked(useAuth)

  beforeEach(() => {
    vi.clearAllMocks()
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
  })

  describe('Component Rendering', () => {
    it('should render login form with all required fields', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Check if all form elements are present
      expect(screen.getByText('🔐 Sign In')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    })

    it('should render form inputs with correct types and attributes', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement

      expect(emailInput.type).toBe('email')
      expect(emailInput.placeholder).toBe('Enter your email')
      expect(emailInput.required).toBe(true)
      
      expect(passwordInput.type).toBe('password')
      expect(passwordInput.placeholder).toBe('Enter your password')
      expect(passwordInput.required).toBe(true)
    })

    it('should show loading state when authentication is in progress', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: true,
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
          <Login />
        </TestWrapper>
      )

      expect(screen.getByText('🔄 Signing in...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
  })

  describe('Form Validation and State Changes', () => {
    it('should update input values when user types', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      expect(emailInput.value).toBe('test@example.com')
      expect(passwordInput.value).toBe('password123')
    })

    it('should show validation error for empty fields', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email and password are required')).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('should clear error messages when user starts typing again', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Trigger validation error first
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email and password are required')).toBeInTheDocument()
      })

      // Start typing - error should clear
      const emailInput = screen.getByPlaceholderText('Enter your email')
      await user.type(emailInput, 'test')

      expect(screen.queryByText('Email and password are required')).not.toBeInTheDocument()
    })
  })

  describe('User Interactions and Authentication Flow', () => {
    it('should call login function with correct credentials on form submission', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1)
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    it('should navigate to home page after successful login', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('should show error message when login fails', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid email or password'
      mockLogin.mockRejectedValue(new Error(errorMessage))
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should reset form after successful login', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput.value).toBe('')
        expect(passwordInput.value).toBe('')
      })
    })

    it('should prevent form submission while loading', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('🔄 Signing in...')).toBeInTheDocument()
    })
  })
})