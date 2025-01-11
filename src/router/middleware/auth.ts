import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { supabase } from '../../boot/supabase'

export async function requireAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Salva a rota que o usuário tentou acessar
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
}

export async function requireGuest(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    next({ path: '/admin' })
    return
  }
  next()
}
