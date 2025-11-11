import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock Firebase
export const mockFirebaseAuth = {
  currentUser: null,
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}

export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn()
}

// Mock Firebase modules
vi.mock('../firebase/index', () => ({
  auth: mockFirebaseAuth,
  db: mockFirestore
}))

// Mock React Router with minimal interference
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children }: { children: React.ReactNode }) => children
}))

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})