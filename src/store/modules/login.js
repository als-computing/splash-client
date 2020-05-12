import Vue from 'vue';
import Vuex from 'vuex';
import {
  AUTH_REQUEST, AUTH_SUCCESS, AUTH_ERROR, LOGOUT
} from './login-mutation-types';



const state = () => ({
    status: '',
    isLoggedIn: false,
    user: {}
  })

const mutations = {
    [AUTH_REQUEST](state) {
      state.status = 'loading';
    },
    [AUTH_SUCCESS](state, user) {
      state.status = 'success';
      state.user = user;
      state.isLoggedIn = true;
    },
    [AUTH_ERROR](state) {
      state.status = 'error';
    },
    [LOGOUT](state) {
      state.status = '';
      state.token = '';
      state.user = {};
      state.isLoggedIn = false;
    }

  }

  const actions = {
    login({ commit }, user) {
        commit(AUTH_REQUEST);
        commit(AUTH_SUCCESS, user);
 
    },


    logout({ commit }) {
    
        commit(LOGOUT);
        // delete axios.defaults.headers.common.Authorization;
        var auth2 = Vue.prototype.$gAuth
        try{
          auth2.signOut()
        }
        catch(error){
          console.error(error)
        }
        commit(LOGOUT)
    },


  }

  const getters = {
    isLoggedIn: (state) => !!state.isLoggedIn,
    authStatus: (state) => state.status,
  }


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  }