import { createClient } from '@supabase/supabase-js'
import { boot } from 'quasar/wrappers'
import { App } from 'vue'

const supabaseUrl = 'https://fqisvpmwislskdkqjxhi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaXN2cG13aXNsc2tka3FqeGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MDI5MTYsImV4cCI6MjA0OTk3ODkxNn0.sVZX7kIk43YOCRcFMnHY_3TIyjVktk_wyoDc0k4xfQ0'

console.log('Inicializando cliente Supabase...')
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Verificar conexão
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Erro ao conectar com Supabase:', error)
  } else {
    console.log('Conexão com Supabase estabelecida:', data)
  }
})

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $supabase: typeof supabase
  }
}

export default boot(({ app }: { app: App }) => {
  // Disponibiliza o cliente Supabase globalmente na aplicação
  app.config.globalProperties.$supabase = supabase
})
