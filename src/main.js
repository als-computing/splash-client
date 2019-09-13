import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import App from './App.vue'
import router from './router'
import store from './store/store'
import './assets/css/main.css'
import axios from 'axios'


Vue.config.productionTip = false

Vue.use({
  install (Vue) {
    var api_url = process.env.VUE_APP_API_URL;
    if (api_url == null){
      api_url = "/api";
    }
    Vue.prototype.$http = axios.create({

    })
    Vue.prototype.$api = axios.create({
      baseURL: api_url
    })
    Vue.prototype.$compounds_url = process.env.VUE_APP_API_URL + '/compounds'
    Vue.prototype.$runs_url = process.env.VUE_APP_API_URL + '/runs'
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

