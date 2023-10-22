import './style/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import vClickOutside from "click-outside-vue3"
// import { createMetaManager, plugin as vueMetaPlugin } from "vue-meta";

window.prerenderReady = false

const app = createApp(App)
// const metaManager = createMetaManager()


app
  .use(store)
  .use(router)
  .mount('#app')

  // .use(metaManager)
  // .use(vClickOutside)
  // .use(vueMetaPlugin)
  // .mount('#app')
