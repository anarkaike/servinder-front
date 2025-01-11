import {computed, ref} from "vue";
import {useRouter} from "vue-router";
import {Notify} from "quasar";
import {User} from "../database/models/User";

const currentUser = ref<any>(null)
const loading = ref(false)

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = computed(() => !!currentUser.value)

  async function loadUser() {
    try {
      loading.value = true
      currentUser.value = await User.getCurrentUser()
    } catch (error) {
      console.error('Error loading user:', error)
      currentUser.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(credentials: { email: string; password: string }) {
    try {
      loading.value = true
      const signedInUser = await User.signIn(credentials)
      currentUser.value = signedInUser
      // Verifica se existe uma rota de redirecionamento
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/admin')
      Notify.create({
        type: 'positive',
        message: 'Login realizado com sucesso!'
      })
    } catch (error: any) {
      console.error('Login error:', error)
      Notify.create({
        type: 'negative',
        message: error.message || 'Erro ao fazer login'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  async function register(data: { email: string; password: string; name: string }) {
    try {
      loading.value = true
      const newUser = await User.signUp(data)
      Notify.create({
        type: 'positive',
        message: 'Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.'
      })
      // Não redirecionar para o login, aguardar confirmação do email
    } catch (error: any) {
      console.error('Register error:', error)
      Notify.create({
        type: 'negative',
        message: error.message || 'Erro ao realizar cadastro'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      await User.signOut()
      currentUser.value = null
      router.push('/login')
      Notify.create({
        type: 'positive',
        message: 'Logout realizado com sucesso!'
      })
    } catch (error: any) {
      console.error('Logout error:', error)
      Notify.create({
        type: 'negative',
        message: error.message || 'Erro ao fazer logout'
      })
    } finally {
      loading.value = false
    }
  }

  return {
    user: currentUser,
    loading,
    isAuthenticated,
    loadUser,
    login,
    register,
    logout
  }
}
