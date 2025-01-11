declare module 'quasar/wrappers' {
  import { App } from 'vue'

  export function boot(fn: (params: { app: App }) => void | Promise<void>): void
}
