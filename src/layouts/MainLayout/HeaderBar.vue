<template>
  <q-tabs dense align="right" class="header-tabs">
    <template v-for="(item, index) in items" :key="index">
      <q-btn-dropdown
        v-if="item.subItems"
        flat
        dense
        class="header-item"
      >
        <template v-slot:label>
          <div class="row items-center no-wrap">
            <q-icon :name="item.icon" size="18px" class="q-mr-sm" v-if="item.icon"/>
            <span v-if="item.label">{{ item.label }}</span>
          </div>
        </template>

        <div class="row dropdown-content">
          <!-- Coluna Esquerda - Estatísticas -->
          <div class="col-6 statistics-column q-pa-md">
            <div class="text-h6 q-mb-md">Estatísticas</div>
            <div class="statistics-content">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-center q-pa-md">
                    <q-circular-progress
                      :value="75"
                      size="100px"
                      color="primary"
                      class="q-ma-md"
                    />
                    <div class="text-caption">Atividade Mensal</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Coluna Direita - SubMenus -->
          <div class="col-6 submenu-column q-pa-md">
            <q-list dense>
              <template v-for="(subItem, subIndex) in item.subItems" :key="subIndex">
                <q-item
                  clickable
                  v-ripple
                  :to="subItem.to"
                  class="submenu-item"
                >
                  <q-item-section avatar v-if="subItem.icon">
                    <q-icon :name="subItem.icon" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    {{ subItem.label }}
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </div>
        </div>
      </q-btn-dropdown>

      <q-tab
        v-else
        :to="item.to"
        class="header-item q-px-sm"
      >
        <div class="row items-center no-wrap">
          <q-icon :name="item.icon" size="18px" class="q-mr-sm" v-if="item.icon"/>
          <span v-if="item.label">{{ item.label }}</span>
        </div>
      </q-tab>
    </template>
  </q-tabs>
</template>

<script setup lang="ts">
interface ISubMenuItem {
  label?: string;
  icon?: string;
  to?: string;
}

interface IMenuItem {
  label?: string;
  icon?: string;
  to?: string;
  tooltip?: string;
  subItems?: ISubMenuItem[];
}

const props = defineProps<{
  items: IMenuItem[];
}>();

// Debug
console.log('HeaderBar props:', props.items);
</script>

<style lang="scss" scoped>
.header-tabs {
  min-width: 200px;
}

.header-item {
  min-height: 36px;
  font-size: 0.9em;
}

.dropdown-content {
  min-width: 600px;
}

.statistics-column {
  border-right: 1px solid #ddd;
}

.submenu-item {
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #f5f5f5;
  }
}

@media (max-width: 599px) {
  .dropdown-content {
    min-width: 300px;
    flex-direction: column;
  }
  
  .statistics-column,
  .submenu-column {
    width: 100%;
  }
  
  .statistics-column {
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
}
</style>
