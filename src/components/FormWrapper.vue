<template>
  <div class="form-wrapper">
    <q-form @submit.prevent="onSubmit" class="q-gutter-md">
      <template v-for="field in fields" :key="field.name">
        <q-input
          v-model="formData[field.name]"
          :label="field.label"
          :type="field.props.type"
          :rules="field.rules"
          v-bind="field.props"
        />
      </template>

      <div class="row justify-end q-gutter-sm">
        <q-btn
          :label="submitLabel"
          type="submit"
          :color="submitColor"
          :loading="loading"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Field {
  name: string
  label: string
  props: {
    type: string
    [key: string]: any
  }
  rules?: ((val: any) => boolean | string)[]
}

interface Props {
  fields: Field[]
  modelValue: Record<string, any>
  submitLabel?: string
  submitColor?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Salvar',
  submitColor: 'primary',
  loading: false
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formData = ref({ ...props.modelValue })

// Atualiza formData quando modelValue (parâmetro externo) mudar
watch(
  () => props.modelValue,
  (newVal) => {
    // Só atualiza se os valores forem realmente diferentes
    if (JSON.stringify(formData.value) !== JSON.stringify(newVal)) {
      formData.value = { ...newVal }
    }
  },
  { deep: true }
)

// Sincroniza mudanças em formData de volta para o pai (com modelValue)
watch(
  formData,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

// Submissão do formulário, disparando o evento 'submit'
const onSubmit = () => {
  emit('submit', { ...formData.value })
}
</script>

<style scoped>
.form-wrapper {
  width: 100%;
}
</style>
