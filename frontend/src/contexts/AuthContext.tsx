'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { authApi } from '@/services/api/auth';
import { User, UserRole } from '@/types/user';

// Types
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithFacebook: (accessToken: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

// Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'INITIALIZE'; payload: { user: User; token: string } | null };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'INITIALIZE':
      if (action.payload) {
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          isLoading: false,
        };
      }
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          
          // Verify token is still valid
          const isValid = await authApi.verifyToken(token);
          if (isValid) {
            authApi.setToken(token);
            dispatch({
              type: 'INITIALIZE',
              payload: { user, token },
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'INITIALIZE', payload: null });
          }
        } else {
          dispatch({ type: 'INITIALIZE', payload: null });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'INITIALIZE', payload: null });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authApi.login({ email, password });
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set token in API client
      authApi.setToken(token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`¡Bienvenido, ${user.firstName}!`);
      
      // Redirect based on role
      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authApi.register(data);
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set token in API client
      authApi.setToken(token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success('¡Cuenta creada exitosamente!');
      
      // Redirect based on role
      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Error al crear cuenta';
      toast.error(message);
      throw error;
    }
  };

  // Google login
  const loginWithGoogle = async (credential: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authApi.googleLogin(credential);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      authApi.setToken(token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`¡Bienvenido, ${user.firstName}!`);
      
      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Error al iniciar sesión con Google';
      toast.error(message);
      throw error;
    }
  };

  // Facebook login
  const loginWithFacebook = async (accessToken: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authApi.facebookLogin(accessToken);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      authApi.setToken(token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`¡Bienvenido, ${user.firstName}!`);
      
      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Error al iniciar sesión con Facebook';
      toast.error(message);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authApi.setToken(null);
    
    dispatch({ type: 'LOGOUT' });
    
    toast.success('Sesión cerrada correctamente');
    router.push('/auth/login');
  };

  // Update user function
  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // Role checking
  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role;
  };

  // Permission checking (extendible para permisos más granulares)
  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;

    const rolePermissions = {
      [UserRole.ADMIN]: ['*'], // Admin tiene todos los permisos
      [UserRole.TEACHER]: [
        'students.read',
        'groups.read',
        'groups.write',
        'attendance.write',
        'activities.write',
        'chat.read',
        'chat.write',
        'calendar.read',
        'calendar.write',
      ],
      [UserRole.PARENT]: [
        'students.read.own',
        'groups.read.own',
        'attendance.read.own',
        'activities.read.own',
        'chat.read.own',
        'chat.write.own',
        'calendar.read.own',
      ],
    };

    const permissions = rolePermissions[state.user.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };

  // Helper function to get redirect path based on role
  const getRedirectPath = (role: UserRole): string => {
    return '/dashboard';
  };

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateUser,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}