<template>
  <q-breadcrumbs class="text-grey text-weight-light breadcrumbs-container">
    {{items}}
    <template v-for="(item, index) in items" :key="index">
      <q-breadcrumbs-el
        :class="[
          'text-white breadcrumb-item',
          { 'gt-sm': item.label && !item.showLabelMobile }
        ]"
        :icon="item.icon"
        :label="item.label"
        :to="item.to"
      />
    </template>
  </q-breadcrumbs>
</template>

<script setup lang="ts">
interface IBreadcrumbItem {
  label?: string;
  icon?: string;
  to?: string;
  showLabelMobile?: boolean;
}

const props = defineProps<{
  items: IBreadcrumbItem[];
}>();

// Debug
console.log('Breadcrumbs props:', props.items);
</script>

<style lang="scss" scoped>
.breadcrumbs-container {
  padding: 8px;
  border-radius: 4px;
  min-width: 200px;
}

.breadcrumb-item {
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
}

@media (max-width: 599px) {
  .gt-sm {
    .q-breadcrumbs-el__label {
      display: none;
    }
  }
}
</style>
