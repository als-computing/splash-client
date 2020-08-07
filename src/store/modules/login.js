import Vue from 'vue';
import { local } from 'd3';
import {
  AUTH_SUCCESS, AUTH_ERROR, LOGOUT,
} from './login-mutation-types';


const state = () => ({
  status: '',
  user: JSON.parse(localStorage.getItem('user')) || {},
  api_access_token: localStorage.getItem('api_access_token') || '',
});

const mutations = {

  [AUTH_SUCCESS](state, payload) {
    localStorage.setItem('api_access_token', payload.access_token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    state.status = 'success';
    state.user = payload.user;
    state.api_access_token = payload.api_access_token;
  },
  [AUTH_ERROR](state) {
    state.status = 'error';
    localStorage.removeItem('api_access_token');
    localStorage.removeItem('user');
  },
  [LOGOUT](state) {
    state.status = '';
    state.user = {};
    state.api_access_token = '';
    localStorage.removeItem('api_access_token');
    localStorage.removeItem('user');
  },
};

const actions = {
  logout({ commit }) {
    console.log('hello');
    commit(LOGOUT);
    const auth2 = window.gapi.auth2.getAuthInstance();
    return auth2.signOut()
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
      // TODO store the refresh-token provided
      commit(AUTH_SUCCESS, {
        user: response.data.user,
        api_access_token: response.data.access_token,
      });
    } catch (error) {
      console.error('Failure!');
      commit(AUTH_ERROR, error);
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
