import BootstrapVue from 'bootstrap-vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex'

import { shallowMount, createLocalVue } from '@vue/test-utils';
import App from '@/App.vue';
import mockAxios from 'axios';

const localVue = createLocalVue();

localVue.use(BootstrapVue);
localVue.use(VueRouter);
localVue.use(Vuex)
localVue.use({
    install(Vue){
      Vue.prototype.$http = mockAxios.create();
    }
})



describe('App.vue (Search Page)', () => {
  beforeEach(() => {
  
  });
    const store = new Vuex.Store({
      state: {
        user: {
          given_name: "testermctester"
        }
      }
    });
    const router = new VueRouter();
    debugger;
    const wrapper = shallowMount(App, {
      localVue,
      router,
      store,
    });

  it('renders the Search Bar component', () => {
    expect(wrapper.find({ name: 'SearchBar' }).exists()).toBe(true);
  });
});
