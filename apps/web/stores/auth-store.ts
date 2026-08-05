import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isFirebaseEnabled, auth } from '@/lib/firebase';
import { apiClient } from '@/lib/api';
// Removed UserRole from the import line
import type { AuthState, User, LoginRequest, RegisterRequest } from '@/types/auth';

function generateDemoUser(data: LoginRequest | RegisterRequest): User {
  const isAdmin = data.email.toLowerCase().includes('admin');
  return {
    id: isAdmin ? 'demo-admin-001' : 'demo-user-001',
    email: data.email,
    firstName: 'firstName' in data ? data.firstName : 'Demo',
    lastName: 'lastName' in data ? data.lastName : 'User',
    firebaseUid: 'demo-uid',
    role: isAdmin ? 'ADMIN' : 'LEARNER',
    roleId: isAdmin ? 'demo-admin-role' : 'demo-role',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

interface AuthPersistState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthTransientState {
  isLoading: boolean;
  error: string | null;
}

// Automatically match whatever role union type is defined inside User['role']
type AllowedRole = User['role'];

type AuthStoreState = AuthPersistState &
  AuthTransientState & {
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    setUser: (user: User | null) => void;
    switchRole: (role: AllowedRole) => void;
    clearError: () => void;
  };

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          if (isFirebaseEnabled) {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const userCredential = await signInWithEmailAndPassword(
              auth,
              data.email,
              data.password,
            );
            const token = await userCredential.user.getIdToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (apiUrl) {
              const user = (await apiClient.post('/auth/login', { idToken: token })) as User;
              set({ user, isLoading: false, isAuthenticated: true });
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
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              data.email,
              data.password,
            );
            const token = await userCredential.user.getIdToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (apiUrl) {
              const user = (await apiClient.post('/auth/login', { idToken: token })) as User;
              set({ user, isLoading: false, isAuthenticated: true });
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

      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),

      switchRole: (role: AllowedRole) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              role,
            },
          });
        } else {
          set({
            user: {
              id: 'demo-user-001',
              email: 'demo@signbridge.ai',
              firstName: 'Demo',
              lastName: 'User',
              firebaseUid: 'demo-uid',
              role,
              roleId: 'demo-role',
              isVerified: true,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            isAuthenticated: true,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'signbridge-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
