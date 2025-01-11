import { boot } from 'quasar/wrappers'
import { supabase } from './supabase'

export default boot(({ app }) => {
  app.config.globalProperties.$supabase = supabase
})

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $supabase: typeof supabase
  }
}
