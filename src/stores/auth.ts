import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as { id: string; name: string } | null
  }),
  actions: {
    setUser(user: { id: string; name: string }) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    }
  }
});
