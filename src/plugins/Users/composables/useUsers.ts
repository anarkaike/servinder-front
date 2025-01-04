import { inject } from 'vue'
import { useUserStore } from '../store/useUserStore'

export function useUsers() {
  return inject('users') || useUserStore()
}
