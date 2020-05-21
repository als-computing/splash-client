import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
// import login from '@/store'
import login from '@/store/modules/login.js'
import { cloneDeep } from 'lodash'


describe('App.vue (Search Page)', () => {
it('tests that login works', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const store = new Vuex.Store({ modules: { login: cloneDeep(login) }})
    expect(store.getters['login/isLoggedIn']).toBe(false)
    store.dispatch('login/login', {name: 'user_name'})
    expect(store.getters['login/isLoggedIn']).toBe(true)
    expect(store.getters['login/user'].name).toBe( 'user_name')
  })
})   