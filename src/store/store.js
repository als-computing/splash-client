import Vue from 'vue';
import Vuex from 'vuex';
import {
  AUTH_REQUEST, AUTH_SUCCESS, AUTH_ERROR, LOGOUT
} from './mutation-types';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    status: '',
    user: {}
  },

  mutations: {
    [AUTH_REQUEST](state) {
      state.status = 'loading';
    },
    [AUTH_SUCCESS](state, user) {
      state.status = 'success';
      state.user = user;
    },
    [AUTH_ERROR](state) {
      state.status = 'error';
    },
    [LOGOUT](state) {
      state.status = '';
      state.token = '';
    }

  },
  actions: {
    login({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit(AUTH_REQUEST);
        //   axios({url: 'http://localhost:3000/login', data: user, method: 'POST' })
        //   .then(resp => {
        //     const token = resp.data.token
        //     const user = resp.data.user
        //     localStorage.setItem('token', token)
        //     axios.defaults.headers.common['Authorization'] = token
        //     commit('auth_success', token, user)
        //     resolve(resp)
        //   })
        //   .catch(err => {
        //     commit('auth_error')
        //     localStorage.removeItem('token')
        //     reject(err)
        //   })
        // })
        commit(AUTH_SUCCESS, user);
      });
    },
    // register({ commit }, user) {
    //   return new Promise((resolve, reject) => {
    //     commit('auth_request');
    //     axios({ url: 'http://localhost:3000/register', data: user, method: 'POST' })
    //       .then((resp) => {
    //         const { token } = resp.data;
    //         const { user } = resp.data;
    //         localStorage.setItem('token', token);
    //         axios.defaults.headers.common.Authorization = token;
    //         commit('auth_success', token, user);
    //         resolve(resp);
    //       })
    //       .catch((err) => {
    //         commit('auth_error', err);
    //         localStorage.removeItem('token');
    //         reject(err);
    //       });
    //   });
    // },

    logout({ commit }) {
      return new Promise((resolve, reject) => {
        commit(LOGOUT);
        // delete axios.defaults.headers.common.Authorization;
        var auth2 = Vue.prototype.$gAuth
        try{
          auth2.signOut()
        }
        catch(error){
          console.error(error)
        }
       
        resolve();
      });
    },


  },
  getters: {
    isLoggedIn: (state) => !!state.user,
    authStatus: (state) => state.status,
  },
});
