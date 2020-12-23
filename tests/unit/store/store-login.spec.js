import Vue from 'vue';

import login from '@/store/modules/login';
import { AUTH_SUCCESS } from '@/store/modules/login-mutation-types';
import { cloneDeep } from 'lodash';
import mockAxios from 'axios';
import App from '@/App.vue';

jest.mock('vue');
// TODO: Test calls to localStorage methods

describe('store actions', () => {
  it('sendOAuthToken', async () => {
    Vue.prototype.$api = mockAxios.create();
    Vue.prototype.$login_url = 'the_one_ring';
    expect(login.getters.isLoggedIn(login.state())).toBe(false);

    Vue.prototype.$api.post.mockResolvedValue({
      data: {
        access_token: 'api_access_token',
        user: {
          given_name: 'eddy',
          family_name: 'merckx',
        },
      },
    });

    const commit = jest.fn();
    await login.actions.sendOAuthToken({ commit }, 'sfsdfsf');

    expect(Vue.prototype.$api.post).toHaveBeenCalledWith(Vue.prototype.$login_url, { token: 'sfsdfsf' }, { headers: { 'Content-Type': 'application/json' } });
    expect(commit).toHaveBeenCalledWith(AUTH_SUCCESS, {
      user: {
        given_name: 'eddy',
        family_name: 'merckx',
      },
      api_access_token: 'api_access_token',
    });
    expect(login.getters.isLoggedIn({ api_access_token: 'api_access_token' })).toBe(true);
  });
});
