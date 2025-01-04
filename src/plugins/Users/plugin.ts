import { Plugin } from 'vue'
import { PiniaPluginContext } from 'pinia'
import { useUserStore } from './store/useUserStore'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $users: ReturnType<typeof useUserStore>
  }
}

export const UserPlugin: Plugin = {
  install(app, options) {
    const pinia = options?.pinia
    if (!pinia) {
      console.error('Pinia instance not found. Make sure to initialize Pinia before installing plugins.')
      return
    }

    // Inicializa o store
    const store = useUserStore(pinia)

    // Adiciona o store como propriedade global
    app.config.globalProperties.$users = store

    // Fornece o store via inject/provide
    app.provide('users', store)
  }
}
 