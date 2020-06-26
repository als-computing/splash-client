import Vue from 'vue';
import { local } from 'd3';
import {
  AUTH_SUCCESS, AUTH_ERROR, LOGOUT,
} from './login-mutation-types';


const state = () => ({
  status: '',
  user: {},
  api_access_token: localStorage.getItem('api_access_token') || '',
});

const mutations = {

  [AUTH_SUCCESS](state, payload) {
    state.status = 'success';
    state.user = payload.user;
    state.api_access_token = payload.api_access_token;
  },
  [AUTH_ERROR](state) {
    state.status = 'error';
  },
  [LOGOUT](state) {
    state.status = '';
    state.user = {};
    localStorage.removeItem('api_access_token');
  },
};

const actions = {
  logout({ commit }) {
    commit(LOGOUT);
    const auth2 = Vue.prototype.$gAuth;
    auth2.signOut()
      .then(() => console.log('User signed out of google'))
      .catch((error) => console.error(error));
  },
  async sendOAuthToken({ commit }, token) {
    // Sends auth token to api server to be validated. If
    // validated, api server will generate own acces token
    const config = { headers: { 'Content-Type': 'application/json' } };
    const bodyParameters = {
      token,
    };

    try {
      const response = await Vue.prototype.$api.post(Vue.prototype.$login_url, bodyParameters, config);
      localStorage.setItem('api_access_token', response.data.access_token); // TODO store the refresh-token provided
      commit(AUTH_SUCCESS, {
        user: response.data.user,
        api_access_token: response.data.access_token,
      });
    } catch (error) {
      console.error('Failure!');
      commit(AUTH_ERROR, error);
      localStorage.removeItem('api_access_token');
    }
  },

};

const getters = {
  isLoggedIn: (state) => !!state.api_access_token,
  user: (state) => state.user,
  api_access_token: (state) => state.api_access_token,
  authStatus: (state) => state.status,
};


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
