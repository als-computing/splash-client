import Vue from 'vue';
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import axios from 'axios';
import GAuth from 'vue-google-oauth2';
import { Plotly } from "vue-plotly"
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/main.css';

const gauthOption = {
  clientId: process.env.VUE_APP_CLIENT_ID.concat('.apps.googleusercontent.com'),
  scope: 'profile email',
  prompt: 'select_account',
};
Vue.use(GAuth, gauthOption);
Vue.use(BootstrapVue);
Vue.use(Router);
Vue.component('plotly', Plotly);

Vue.config.productionTip = false;

Vue.use({
  install(Vue) {
    let apiUrl = process.env.VUE_APP_API_URL;
    if (apiUrl == null) {
      apiUrl = '/api';
    }
    let searchUrl = process.env.VUE_APP_API_URL;
    if (searchUrl == null) {
      searchUrl = '/elasticsearch';
    }
    // Vue.prototype.$http = axios.create({

    // });
    Vue.prototype.$api = axios.create({
      baseURL: apiUrl,
    });
    Vue.prototype.$search = axios.create({
      baseURL: searchUrl,
    });
    Vue.prototype.$compounds_url = 'compounds';
    Vue.prototype.$runs_url = 'runs';
    Vue.prototype.$login_url = 'tokensignin';
    Vue.prototype.$elastic_index_url = 'experiments1/_search';
  },
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
