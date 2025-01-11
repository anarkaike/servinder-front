<template>
  <q-page class="row items-center justify-evenly">
    <div class="col-12 col-md-8 q-pa-md">
      
      <!-- Formulário de Criação -->
      <div class="q-mb-lg">
        <FormWrapper
          :fields="formFields"
          v-model="newItem"
          @submit="createItem"
          class="q-gutter-y-md"
          submit-label="Criar"
        />
      </div>

      <!-- Lista de Itens -->
      <q-list bordered separator>
        <q-item v-for="item in items" :key="item.id">
          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
            <q-item-label caption>{{ item.email }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round color="primary" icon="edit" @click="startEdit(item)" />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Diálogo de Edição -->
      <q-dialog v-model="editDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Editar Item</div>
          </q-card-section>

          <q-card-section>
            <FormWrapper
              :fields="formFields"
              v-model="editingItem"
              @submit="updateItem"
              class="q-gutter-y-md"
              submit-label="Atualizar"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Notify } from 'quasar'
import { Teste } from "@models/Teste";
import FormWrapper from '@components/FormWrapper.vue'

interface Item {
  id: string
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

const items = ref<Item[]>([])
const newItem = ref({ name: '', email: '' })
const editDialog = ref(false)
const editingItem = ref<Item>({ id: '', name: '', email: '' })

// Configuração dos campos do formulário
const formFields = [
  {
    label: 'Nome',
    name: 'name',
    props: {
      type: 'text',
      outlined: true,
      dense: true
    },
    rules: [(val: string) => !!val || 'Nome é obrigatório']
  },
  {
    label: 'Email',
    name: 'email',
    props: {
      type: 'email',
      outlined: true,
      dense: true
    },
    rules: [
      (val: string) => !!val || 'Email é obrigatório',
      (val: string) => /.+@.+\..+/.test(val) || 'Email inválido'
    ]
  }
]

// Carregar itens
const loadItems = async () => {
  try {
    const data = await Teste.all()
    items.value = data
  } catch (error) {
    console.error('Erro ao carregar itens:', error)
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar itens'
    })
  }
}

// Criar item
const createItem = async (data: typeof newItem.value) => {
  try {
    await Teste.create(data)
    await loadItems()
    newItem.value = { name: '', email: '' }
    Notify.create({
      type: 'positive',
      message: 'Item criado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao criar item:', error)
    Notify.create({
      type: 'negative',
      message: 'Erro ao criar item'
    })
  }
}

// Iniciar edição
const startEdit = (item: Item) => {
  editingItem.value = { ...item }
  editDialog.value = true
}

// Atualizar item
const updateItem = async (data: typeof editingItem.value) => {
  try {
    await Teste.update(data.id, data)
    await loadItems()
    editDialog.value = false
    Notify.create({
      type: 'positive',
      message: 'Item atualizado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao atualizar item:', error)
    Notify.create({
      type: 'negative',
      message: 'Erro ao atualizar item'
    })
  }
}

// Deletar item
const deleteItem = async (id: string) => {
  try {
    await Teste.delete(id)
    await loadItems()
    Notify.create({
      type: 'positive',
      message: 'Item deletado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao deletar item:', error)
    Notify.create({
      type: 'negative',
      message: 'Erro ao deletar item'
    })
  }
}

// Carregar itens ao montar o componente
onMounted(() => {
  loadItems()
})
</script>

<style scoped>
.q-page {
  padding: 20px;
}
</style>
