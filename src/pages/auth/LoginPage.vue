<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card q-pa-lg">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            :rules="[val => !!val || 'Email é obrigatório']"
          />

          <q-input
            v-model="form.password"
            label="Senha"
            :type="showPassword ? 'text' : 'password'"
            :rules="[val => !!val || 'Senha é obrigatória']"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div>
            <q-btn
              label="Entrar"
              type="submit"
              color="primary"
              :loading="loading"
              class="full-width"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center">
        <router-link to="/register" class="text-primary">
          Não tem uma conta? Cadastre-se
        </router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from 'src/composables/useAuth'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { login, loading } = useAuth()

const showPassword = ref(false)
const form = ref({
  email: '',
  password: ''
})

async function handleSubmit() {
  try {
    await login(form.value)
    // Redireciona para a página que o usuário tentou acessar originalmente
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
}
</style>
