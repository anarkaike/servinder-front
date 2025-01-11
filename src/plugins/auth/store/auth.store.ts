import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Role } from '../types';
import { authService } from '../services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const roles = ref<Role[]>([]);
  const isAuthenticated = computed(() => !!user.value);

  async function setUser(userData: User) {
    const userWithRoles = await authService.getUserWithRoles(userData.id);
    user.value = userWithRoles;
    roles.value = userWithRoles.roles;
  }

  function clearUser() {
    user.value = null;
    roles.value = [];
  }

  async function hasPermission(permissionName: string): Promise<boolean> {
    if (!user.value) return false;
    return authService.validatePermission(user.value.id, permissionName);
  }

  return {
    user,
    roles,
    isAuthenticated,
    setUser,
    clearUser,
    hasPermission,
  };
});
