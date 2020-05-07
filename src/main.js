import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import store from './store/store';
import './assets/css/main.css';
import GAuth from 'vue-google-oauth2'

const gauthOption = {
  clientId: process.env.VUE_APP_CLIENT_ID.concat('.apps.googleusercontent.com'),
  scope: 'profile email',
  prompt: 'select_account'
}
Vue.use(GAuth, gauthOption)
Vue.use(BootstrapVue);


Vue.config.productionTip = false;

Vue.use({
  install(Vue) {
    let api_url = process.env.VUE_APP_API_URL;
    if (api_url == null) {
      api_url = '/api';
    }
    Vue.prototype.$http = axios.create({

    });
    Vue.prototype.$api = axios.create({
      baseURL: api_url,
    });
    Vue.prototype.$compounds_url = `${process.env.VUE_APP_API_URL}/compounds`;
    Vue.prototype.$runs_url = `${process.env.VUE_APP_API_URL}/runs`;
    Vue.prototype.$login_url = 'tokensignin';
  },
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
