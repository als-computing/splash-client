import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';

import login from '@/store/modules/login.js';
import { cloneDeep } from 'lodash';
import mockAxios from 'axios';
import App from '@/App.vue';

// TODO: Test calls to localStorage methods

describe('App.vue (Search Page)', () => {
  it('tests that login works', async () => {
    const localVue = createLocalVue();
    localVue.use(Vuex);
    /* localVue.use({
      install(local) {
        local.prototype.$api = mockAxios;
        console.log(`created vue${local.prototype.$api}`);
      },
    }); */

    const store = new Vuex.Store({ modules: { login: cloneDeep(login) } });
    const localwrapper = mount(App, { store, localVue },
      {
        mocks: {
          $api: mockAxios.create(),
          $login_url: 'the_one_ring',
        },
      });
    expect(store.getters['login/isLoggedIn']).toBe(false);

    localwrapper.vm.$api.post.mockResolvedValue({
      data: {
        api_access_token: 'api_access_token',
        user: {
          given_name: 'eddy',
          family_name: 'merckx',
        },
      },
    });
    const response = await store.dispatch('login/sendOAuthToken', 'sfsdfsf');

    // test is failing because the login.js isn't getting the Vue.prototype.$api
    // installed during test. Need to leave this for now.


    expect(localVue.prototype.$api.post).toHaveBeenCalledWith(localwrapper.vm.$login_url, { data: 'sfsdfsf' });
    expect(store.getters['login/isLoggedIn']).toBe(true);
    expect(store.getters['login/user'].name).toBe('user_name');
  });
});
