import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { authApi, type LoginRequest, type SignupRequest } from '@/services/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Mock admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_USER: User = {
  id: 'admin',
  email: ADMIN_EMAIL,
  name: 'System Administrator',
  role: 'admin'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string, role: UserRole) => {
        set({ isLoading: true, error: null });
        
        try {
          // Check for admin credentials first
          if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD && role === 'admin') {
            set({ 
              user: ADMIN_USER, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            return true;
          }
          
          // For other users, try API call
          const request: LoginRequest = { email, password, role };
          const response = await authApi.login(request);
          
          if (response.message === 'Login successful') {
            const user: User = {
              id: email, // Use email as consistent ID
              email: email,
              name: response.user?.full_name || email,
              role: response.user?.role as UserRole || role,
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            return true;
          } else {
            set({ 
              isLoading: false, 
              error: response.message || 'Login failed' 
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return false;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        }
      },
      
      signup: async (email: string, password: string, name: string, role: UserRole) => {
        set({ isLoading: true, error: null });
        
        try {
          // Only allow parent and doctor signups through frontend
          if (role === 'admin') {
            set({ 
              isLoading: false, 
              error: 'Admin accounts cannot be created through signup' 
            });
            return false;
          }
          
          const request: SignupRequest = { name, email, password, role: role as 'parent' | 'doctor' };
          const response = await authApi.signup(request);
          
          if (response.message === 'User registered successfully') {
            const user: User = {
              id: email, // Use email as consistent ID
              email: email,
              name: name,
              role: role,
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            return true;
          } else {
            set({ 
              isLoading: false, 
              error: response.message || 'Signup failed' 
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return false;
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      checkAuthStatus: async () => {
        set({ isLoading: true });
        
        try {
          // First check if we have user data in localStorage
          const state = get();
          if (state.user && state.isAuthenticated) {
            // User is already authenticated from localStorage
            set({ isLoading: false });
            return;
          }
          
          // Try API call to check auth status
          const { isAuthenticated, user } = await authApi.checkAuth();
          if (isAuthenticated && user) {
            // Validate that the role is one of the allowed values
            const validRoles: UserRole[] = ['parent', 'doctor', 'admin'];
            const role = validRoles.includes(user.role as UserRole) ? user.role as UserRole : 'parent';
            
            const userData: User = {
              id: user.email,
              email: user.email,
              name: user.full_name,
              role: role,
            };
            set({ isAuthenticated: true, user: userData, isLoading: false });
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // If API fails, check localStorage again as fallback
          const state = get();
          if (state.user && state.isAuthenticated) {
            set({ isLoading: false });
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
