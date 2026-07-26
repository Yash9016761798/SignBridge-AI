import { create } from 'zustand';
import { isFirebaseEnabled, auth } from '@/lib/firebase';
import { apiClient } from '@/lib/api';
import type { AuthState, User, LoginRequest, RegisterRequest } from '@/types/auth';

function generateDemoUser(data: LoginRequest | RegisterRequest): User {
  return {
    id: 'demo-user-001',
    email: data.email,
    firstName: 'firstName' in data ? data.firstName : 'Demo',
    lastName: 'lastName' in data ? data.lastName : 'User',
    firebaseUid: 'demo-uid',
    role: 'LEARNER',
    roleId: 'demo-role',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      if (isFirebaseEnabled) {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const token = await userCredential.user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
          const response = (await apiClient.post('/auth/login', { idToken: token })) as {
            success: boolean;
            data: User;
          };
          set({ user: response.data, isLoading: false, isAuthenticated: true });
        } else {
          const user = generateDemoUser(data);
          set({ user, isLoading: false, isAuthenticated: true });
        }
      } else {
        const user = generateDemoUser(data);
        set({ user, isLoading: false, isAuthenticated: true });
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Login failed' });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      if (isFirebaseEnabled) {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const token = await userCredential.user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
          const response = (await apiClient.post('/auth/login', { idToken: token })) as {
            success: boolean;
            data: User;
          };
          set({ user: response.data, isLoading: false, isAuthenticated: true });
        } else {
          const user = generateDemoUser(data);
          set({ user, isLoading: false, isAuthenticated: true });
        }
      } else {
        const user = generateDemoUser(data);
        set({ user, isLoading: false, isAuthenticated: true });
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Registration failed' });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      if (isFirebaseEnabled) {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
      }
      set({ user: null, isLoading: false, isAuthenticated: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Logout failed' });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      if (isFirebaseEnabled) {
        const { sendPasswordResetEmail } = await import('firebase/auth');
        await sendPasswordResetEmail(auth, email);
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Password reset failed' });
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      if (isFirebaseEnabled) {
        const { confirmPasswordReset } = await import('firebase/auth');
        await confirmPasswordReset(auth, token, password);
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Password reset failed' });
      throw error;
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => set({ error: null }),
}));
