import { boot } from 'quasar/wrappers'
import FormGenerator from 'quasar-form-generator'

export default boot(({ app }) => {
  app.component('FormGenerator', FormGenerator)
})
