import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import { directive as clickOutside } from 'v-click-outside-x'
const { app } = require('electron').remote
console.log('app1', app);
// const model = require('./lib/db')
import { initDb } from './lib/db'
console.log('datapath', app.getPath('userData'));
initDb(app.getPath('userData'))

Vue.directive('clickOutside', clickOutside)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
