import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import App from '@/App.vue';
import VueRouter from 'vue-router';
import Login from '@/views/Login.vue';
import routes from '@/routes.js';
import BootstrapVue from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(VueRouter);
localVue.use(BootstrapVue);

describe('App', () => {
  it('renders a child component via routing', () => {
    const router = new VueRouter({ routes });
    const wrapper = mount(App, { localVue, router });

    router.push('/login');

    expect(wrapper.find(Login).exists()).toBe(true);
  });
});
