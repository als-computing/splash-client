import { /* shallowMount, */ mount, createLocalVue } from '@vue/test-utils';
import App from '@/App.vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Login from '@/views/Login.vue';
import routes from '@/routes.js';
import BootstrapVue from 'bootstrap-vue';
import mockAxios from 'axios';

const localVue = createLocalVue();
localVue.use(VueRouter);
localVue.use(BootstrapVue);
localVue.use(Vuex);
localVue.use({
  install(Vue) {
    Vue.prototype.$http = mockAxios.create();
  },
});

describe('App', () => {
  it('renders a child component via routing', () => {
    const router = new VueRouter({ routes });
    const store = new Vuex.Store({
      state: {
        login: {
          user: {
            given_name: 'testermctester',
          },
        },
      },
    });
    const wrapper = mount(App, { localVue, router, store });

    router.push('/login');

    expect(wrapper.find(Login).exists()).toBe(true);
  });
});
