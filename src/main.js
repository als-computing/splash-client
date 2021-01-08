import Vue from 'vue';
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import axios from 'axios';
// import { Plotly } from "vue-plotly"
import { axisBottom } from 'd3';
import App from './App.vue';
import FiveHundred from './views/500.vue';
import router from './router';
import store from './store';
import './assets/css/main.css';

Vue.use(BootstrapVue);
Vue.use(Router);
Vue.config.productionTip = false;
const apiUrl = '/api/v1';
let settings = null;
const doiURL = 'https://dx.doi.org';

Vue.use({
  async install(Vue) {
    await getSettings();
    console.log(`google client id${settings.google_client_id}`);
    Vue.prototype.$settings = settings;
    const searchUrl = '/elasticsearch';

    Vue.prototype.$api = axios.create({
      baseURL: apiUrl,
    });
    Vue.prototype.$search = axios.create({
      baseURL: searchUrl,
    });
    Vue.prototype.$doi_service = axios.create({
      baseURL: doiURL,
      headers: { Accept: 'application/citeproc+json' },
    });
    Vue.prototype.$api_url = apiUrl;
    Vue.prototype.$compounds_url = 'pages/page_type/compound';
    Vue.prototype.$pages_url = 'pages';
    Vue.prototype.$runs_url = 'runs';
    Vue.prototype.$login_url = 'idtokensignin';
    Vue.prototype.$references_url = 'references';
    Vue.prototype.$doi_service_url = '';
    Vue.prototype.$elastic_index_url = 'run_start/_search';
  },
});


function onGoogleError() {
  new Vue({
    router,
    store,
    render: (h) => h(FiveHundred),
  }).$mount('#app');
}

async function onGoogleLoad() {
  // This function is called when the google auth library has loaded into
  // the page

  // asyncified the load method inspired by:
  // https://stackoverflow.com/a/51939030/8903570
  // This loads the auth2 part of the google auth library,
  // Necessary for functionality like programatically logging the user out
  // of the app: https://developers.google.com/identity/sign-in/web/reference
  await new Promise((resolve) => window.gapi.load('auth2', resolve));
  try {
    if (settings == null) {
      await getSettings();
    }
    // Initializes it with the correct client ID
    await window.gapi.auth2.init(
      {

        client_id: settings.google_client_id,
      },
    );
  } catch (e) {
    console.log(e);
    onGoogleError();
    return;
  }
  // only AFTER this has all been loaded
  // do we mount the app. The google functionality is
  // _essential_ to our app, we want to ensure that the
  // google library is loaded before anything else.
  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app');
}

async function getSettings() {
  const response = await axios.get(`${apiUrl}/settings`, {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
  if (response.data) {
    settings = response.data;
  }
}

// document.onload = getSettings();

// Construct src element for google sign in script
const script = document.createElement('script');
script.src = 'https://apis.google.com/js/platform.js';
script.async = true;
script.defer = true;

script.onload = onGoogleLoad; // When the script loads we call this function
script.onerror = onGoogleError; // When there's an error, call this function
document.head.appendChild(script); // Inject the script
