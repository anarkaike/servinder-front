import { computed } from 'vue';
import { useAuthStore } from '../store/auth.store';
import type { User, Role } from '../types';

export function useAuth() {
  const authStore = useAuthStore();

  const user = computed(() => authStore.user);
  const roles = computed(() => authStore.roles);
  const isAuthenticated = computed(() => authStore.isAuthenticated);

  async function login(credentials: { email: string; password: string }) {
    // Implementar lógica de login
  }

  async function logout() {
    authStore.clearUser();
  }

  async function hasPermission(permission: string): Promise<boolean> {
    return authStore.hasPermission(permission);
  }

  return {
    user,
    roles,
    isAuthenticated,
    login,
    logout,
    hasPermission,
  };
}
