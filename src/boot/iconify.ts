import { boot } from 'quasar/wrappers'
import { Icon } from '@iconify/vue'

export default boot(({ app }): void => {
  app.component('Icon', Icon);
})
