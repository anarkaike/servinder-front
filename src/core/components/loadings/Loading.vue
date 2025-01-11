<template>
  <q-inner-loading
    :showing="visible"
    label="Please wait..."
    label-class="text-teal"
    label-style="font-size: 1.1em"
    :v-on="$listeners"
    :bind="$attrs"
  />
</template>
<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>
