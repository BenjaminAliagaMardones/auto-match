import { create } from 'zustand';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth';

// 1. Estado Global (Zustand)
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));

// 2. Hook para usar en React
export function useAuth() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Guardamos el usuario que devuelve el backend
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
  });

  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    enabled: !!sessionStorage.getItem('auth-token') && !user,
    onSuccess: (data) => setUser(data),
    retry: false,
  });

  const logout = () => {
    authService.logout();
    clearAuth();
    queryClient.clear();
  };

  return {
    user,
    isAuthenticated,
    isLoading: loginMutation.isPending || profileQuery.isLoading,
    error: loginMutation.error,
    login: loginMutation.mutate,
    // Register
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
}