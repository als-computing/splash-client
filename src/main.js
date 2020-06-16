import Vue from 'vue';
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/main.css';
import GAuth from 'vue-google-oauth2'

const gauthOption = {
  clientId: process.env.VUE_APP_CLIENT_ID.concat('.apps.googleusercontent.com'),
  scope: 'profile email',
  prompt: 'select_account'
}
Vue.use(GAuth, gauthOption)
Vue.use(BootstrapVue);
Vue.use(Router);

Vue.config.productionTip = false;

Vue.use({
  install(Vue) {
    let api_url = process.env.VUE_APP_API_URL;
    if (api_url == null) {
      api_url = '/api';
    }
    let search_url = process.env.VUE_APP_API_URL;
    if (search_url == null) {
      search_url = '/elasticsearch';
    }
    // Vue.prototype.$http = axios.create({

    // });
    Vue.prototype.$api = axios.create({
      baseURL: api_url,
    });
    Vue.prototype.$search = axios.create({
      baseURL: search_url,
    })
    Vue.prototype.$compounds_url = 'compounds';
    Vue.prototype.$login_url = 'tokensignin';
    Vue.prototype.$elastic_index_url = 'experiments1/_search';
  },
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
