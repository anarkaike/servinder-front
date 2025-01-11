import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { supabase } from '../../boot/supabase'
import { Notify } from 'quasar'

export async function handleAuthCallback(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Se tiver access_token no hash, significa que é um callback de autenticação
  if (to.hash.includes('access_token=')) {
    const hashParams = new URLSearchParams(
      to.hash.substring(1) // Remove o # do início
    )
    
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const expiresIn = hashParams.get('expires_in')
    const tokenType = hashParams.get('token_type')
    const type = hashParams.get('type')

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: parseInt(expiresIn || '3600'),
        token_type: tokenType || 'bearer'
      })

      if (error) {
        console.error('Erro ao definir sessão:', error)
        Notify.create({
          type: 'negative',
          message: 'Erro ao confirmar email. Por favor, tente novamente.'
        })
        next('/login')
        return
      }

      // Se for confirmação de email, mostrar mensagem de sucesso
      if (type === 'signup') {
        Notify.create({
          type: 'positive',
          message: 'Email confirmado com sucesso! Bem-vindo ao Servinder!'
        })
      }

      // Redirecionar para a página inicial após definir a sessão
      next('/admin')
      return
    }
  }

  next()
}
