import BootstrapVue from 'bootstrap-vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vue from 'vue';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import App from '@/App.vue';
import mockAxios from 'axios';

const localVue = createLocalVue();

localVue.use(BootstrapVue);
localVue.use(VueRouter);
localVue.use(Vuex);
localVue.use({
  install(Vue) {
    Vue.prototype.$api = mockAxios.create();
  },
});


describe('App.vue (Search Page)', () => {
  let getters;
  let store;
  let logonUser = {};
  let isLoggedIn = false;
  const router = new VueRouter();
  beforeEach(() => {
    getters = {
      'login/isLoggedIn': () => isLoggedIn,
      'login/user': () => logonUser,
    };

    store = new Vuex.Store({ getters });
  });

  it('renders the Search Bar component', () => {
    const localwrapper = mount(App, { store, localVue, router });
    expect(localwrapper.findComponent({ name: 'SearchBar' }).exists()).toBe(true);
  });

  it('shows logged out without store login', async () => {
    const localwrapper = mount(App, { store, localVue, router });
    expect(localwrapper.find('#logout').exists()).toBe(false);
    expect(localwrapper.find('#user_name').text()).toBe('');
  });

  it('shows user and logout button when logged in', async () => {
    logonUser = { given_name: 'zaphod' };
    isLoggedIn = true;
    const localwrapper = mount(App, { store, localVue, router });
    expect(localwrapper.find('#logout').element).toBeVisible();
    expect(localwrapper.find('#user_name').text()).toBe('zaphod');
  });
});
