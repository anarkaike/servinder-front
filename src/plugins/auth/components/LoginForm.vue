<template>
  <q-form @submit="handleSubmit" class="q-gutter-md">
    <q-input
      v-model="email"
      label="Email"
      type="email"
      :rules="[val => !!val || 'Email é obrigatório']"
    />

    <q-input
      v-model="password"
      label="Senha"
      :type="isPwd ? 'password' : 'text'"
      :rules="[val => !!val || 'Senha é obrigatória']"
    >
      <template v-slot:append>
        <q-icon
          :name="isPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPwd = !isPwd"
        />
      </template>
    </q-input>

    <q-btn label="Entrar" type="submit" color="primary"/>
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const email = ref('');
const password = ref('');
const isPwd = ref(true);
const { login } = useAuth();

async function handleSubmit() {
  try {
    await login({
      email: email.value,
      password: password.value
    });
  } catch (error) {
    console.error('Erro no login:', error);
  }
}
</script>
