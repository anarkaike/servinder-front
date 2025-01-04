<template>
  <q-page class="row items-center justify-evenly">
    <div class="column q-pa-md">
      <h5>Teste CRUD com Drizzle ORM</h5>
      
      <!-- Formulário de Criação -->
      <div class="q-mb-md">
        <q-input v-model="newItem.name" label="Nome" class="q-mb-sm" />
        <q-input v-model="newItem.email" label="Email" class="q-mb-sm" />
        <q-btn color="primary" @click="createItem" label="Criar" />
      </div>

      <!-- Lista de Itens -->
      <q-list bordered class="rounded-borders">
        <q-item v-for="item in items" :key="item.id">
          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
            <q-item-label caption>{{ item.email }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center">
              <q-btn flat round color="primary" icon="edit" @click="startEdit(item)" />
              <q-btn flat round color="negative" icon="delete" @click="deleteItem(item.id)" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Modal de Edição -->
      <q-dialog v-model="editDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Editar Item</div>
          </q-card-section>

          <q-card-section>
            <q-input v-model="editingItem.name" label="Nome" class="q-mb-sm" />
            <q-input v-model="editingItem.email" label="Email" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
            <q-btn flat label="Salvar" color="primary" @click="updateItem" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Notify } from 'quasar'
import { Teste } from 'src/models/Teste'

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
const createItem = async () => {
  try {
    const data = await Teste.create(newItem.value)
    if (data) {
      newItem.value = { name: '', email: '' }
      loadItems()
      Notify.create({
        type: 'positive',
        message: 'Item criado com sucesso!'
      })
    }
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
const updateItem = async () => {
  try {
    const data = await Teste.update(editingItem.value.id, {
      name: editingItem.value.name,
      email: editingItem.value.email
    })
    
    if (data) {
      loadItems()
      Notify.create({
        type: 'positive',
        message: 'Item atualizado com sucesso!'
      })
    }
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
    loadItems()
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
