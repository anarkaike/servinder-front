<template>
  <div class="menu-builder">
    <q-tree
      :nodes="menuItems"
      node-key="id"
      default-expand-all
      draggable
      @move="handleMove"
    >
      <template v-slot:default-header="prop">
        <div class="row items-center">
          <q-icon :name="prop.node.icon || 'menu'" class="q-mr-sm" />
          <div>{{ prop.node.name }}</div>
          <q-space />
          <q-btn-group flat>
            <q-btn flat round size="sm" icon="edit" @click.stop="editItem(prop.node)" />
            <q-btn flat round size="sm" icon="add" @click.stop="addChild(prop.node)" />
            <q-btn flat round size="sm" icon="delete" @click.stop="removeItem(prop.node)" />
          </q-btn-group>
        </div>
      </template>
    </q-tree>

    <q-dialog v-model="editDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ editingItem ? 'Editar Menu' : 'Novo Menu' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.name" label="Nome" :rules="[val => !!val || 'Nome é obrigatório']" />
          <q-input v-model="form.icon" label="Ícone" />
          <q-input v-model="form.path" label="Caminho" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Salvar" color="primary" @click="saveItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMenuStore } from '../store/menu.store';
import type { Menu } from '../types';

const props = defineProps<{
  locationId: string;
}>();

const menuStore = useMenuStore();
const editDialog = ref(false);
const editingItem = ref<Menu | null>(null);
const form = ref({
  name: '',
  icon: '',
  path: '',
});

const menuItems = computed(() => menuStore.menuTree);

async function loadMenus() {
  await menuStore.loadMenus(props.locationId);
}

function editItem(item: Menu) {
  editingItem.value = item;
  form.value = {
    name: item.name,
    icon: item.icon || '',
    path: item.path || '',
  };
  editDialog.value = true;
}

function addChild(parent: Menu | null = null) {
  editingItem.value = null;
  form.value = {
    name: '',
    icon: '',
    path: '',
  };
  editDialog.value = true;
}

async function saveItem() {
  const menuData = {
    ...form.value,
    parentId: editingItem.value?.id || null,
    locationId: props.locationId,
  };

  if (editingItem.value) {
    await menuStore.updateMenu(editingItem.value.id, menuData);
  } else {
    await menuStore.addMenu(menuData);
  }

  editDialog.value = false;
  loadMenus();
}

async function removeItem(item: Menu) {
  // Implementar remoção
}

async function handleMove({ node, info }: any) {
  // Implementar reordenação
}

loadMenus();
</script>
