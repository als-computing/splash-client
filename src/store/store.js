import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import {AUTH_REQUEST, AUTH_SUCCESS, AUTH_ERROR, LOGOUT} from './mutation-types'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    user : {}
  },
  mutations: {
    [AUTH_REQUEST](state){
      state.status = 'loading'
    },
    [AUTH_SUCCESS](state, token, user){
      state.status = 'success'
      state.token = token
      state.user = user
    },
    [AUTH_ERROR](state){
      state.status = 'error'
    },
    [LOGOUT](state){
      state.status = ''
      state.token = ''
    },
  },
  actions: {
    login({commit}, user){
      return new Promise((resolve, reject) => {
        commit('auth_request')
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
        commit('auth_success', 'token1', user)
      })
    },
    register({commit}, user){
      return new Promise((resolve, reject) => {
        commit('auth_request')
        axios({url: 'http://localhost:3000/register', data: user, method: 'POST' })
        .then(resp => {
          const token = resp.data.token
          const user = resp.data.user
          localStorage.setItem('token', token)
          axios.defaults.headers.common['Authorization'] = token
          commit('auth_success', token, user)
          resolve(resp)
        })
        .catch(err => {
          commit('auth_error', err)
          localStorage.removeItem('token')
          reject(err)
        })
      })
    },
  
    logout({commit}){
      return new Promise((resolve, reject) => {
        commit('logout')
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        resolve()
      })
    },

    
    },
    getters : {
      isLoggedIn: state => !!state.token,
      authStatus: state => state.status,
    }
})
