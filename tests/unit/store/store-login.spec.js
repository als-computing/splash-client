import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Vue from 'vue';

import login from '@/store/modules/login.js'
import { cloneDeep } from 'lodash'
import mockAxios from 'axios';
import App from '@/App.vue';


describe('App.vue (Search Page)', () => {
  
it('tests that login works', async () => {  
    const localVue = createLocalVue();
    localVue.use(Vuex);
    localVue.use({
      install(Vue){
        Vue.prototype.$api = mockAxios.create();
        console.log("created vue" + Vue.prototype.$api);
      }
    });

    const store = new Vuex.Store({ modules: { login: cloneDeep(login) }});
    const localwrapper =  mount(Component, {store, localVue});
    expect(store.getters['login/isLoggedIn']).toBe(false);
    
    mockAxios.post.mockResolvedValue({
      data: { api_access_token: 'api_access_token', 
              user:{
                given_name:'eddy', 
                family_name:'merckx'}
            }
    });
    let response = await store.dispatch('login/sendOAuthToken', 'sfsdfsf')
    
    // test is failing because the login.js isn't getting the Vue.prototype.$api 
    // installed during test. Need to leave this for now.

    
    expect(mockAxios.post).toHaveBeenCalledWith(Vue.prototype.$login_url, {data: 'sfsdfsf' });
    expect(store.getters['login/isLoggedIn']).toBe(true);
    expect(store.getters['login/user'].name).toBe( 'user_name');
  })
})   