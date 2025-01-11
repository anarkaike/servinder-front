<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card q-pa-lg">
      <q-card-section>
        <div class="text-h6">Cadastro</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Nome"
            :rules="[val => !!val || 'Nome é obrigatório']"
          />

          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            :rules="[
              val => !!val || 'Email é obrigatório',
              val => val.includes('@') || 'Email inválido'
            ]"
          />

          <q-input
            v-model="form.password"
            label="Senha"
            :type="showPassword ? 'text' : 'password'"
            :rules="[
              val => !!val || 'Senha é obrigatória',
              val => val.length >= 6 || 'A senha deve ter no mínimo 6 caracteres'
            ]"
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
              label="Cadastrar"
              type="submit"
              color="primary"
              :loading="loading"
              class="full-width"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center">
        <router-link to="/login" class="text-primary">
          Já tem uma conta? Faça login
        </router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from "../../composables/useAuth"

const { register, loading } = useAuth()
const showPassword = ref(false)
const form = ref({
  name: '',
  email: '',
  password: ''
})

async function handleSubmit() {
  try {
    await register(form.value)
  } catch (error) {
    console.error('Register error:', error)
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
}
</style>
