import BootstrapVue from 'bootstrap-vue';
import VueRouter from 'vue-router';
import store from '@/store/store';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import App from '@/App.vue';
// import SearchBar from '@/components/SearchBar.vue';


const localVue = createLocalVue();

localVue.use(BootstrapVue);
localVue.use(VueRouter);
const router = new VueRouter();

describe('App.vue (Search Page)', () => {
  const wrapper = shallowMount(App, {
    localVue,
    router,
    store,
  });

  it('renders the Search Bar component', () => {
    expect(wrapper.find({ name: 'SearchBar' }).exists()).toBe(true);
  });
});
