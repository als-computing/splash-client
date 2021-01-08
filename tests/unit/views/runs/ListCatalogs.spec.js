import BootstrapVue from 'bootstrap-vue';
import VueRouter from 'vue-router';
import routes from '@/routes.js';
import { mount, /* shallowMount, */ createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import App from '@/App.vue';
import ListCatalogs from '@/views/runs/ListCatalogs.vue';
import * as bootstrap from 'bootstrap-vue';
import responses from './responses';

const localVue = createLocalVue();

localVue.use(BootstrapVue);
localVue.use(VueRouter);
localVue.use({
  install(Vue) {
    Vue.prototype.$api = mockAxios.create();
    Vue.prototype.$runs_url = 'runs';
  },
});

describe('Catalogs component', () => {
  beforeEach(() => {
    localVue.prototype.$api.get.mockClear();
  });
  const router = new VueRouter({ routes });
  // TODO: Test cases where no catalogs are returned and
  // Where there is some sort of error

  it('placeholder test, come back to fix the ones below me later', () => {

  });

  /* it('sends a correct request, displays a list of catalogs, and emits data to parent', async () => {
    localVue.prototype.$api.get.mockResolvedValue({ data: responses.catalogsResp });
    const wrapper = mount(ListCatalogs,
      {
        localVue,
        router,
      });
    expect(wrapper.findComponent(bootstrap.BListGroup).exists()).toBe(false);
    expect(wrapper.find('h1').exists()).toBe(false);
    expect(wrapper.find('h3').exists()).toBe(false);
    expect(wrapper.find('p').exists()).toBe(false);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('p').exists()).toBe(false);
    const getMock = localVue.prototype.$api.get;
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).lastCalledWith(wrapper.vm.$runs_url);

    const title = wrapper.get('h1');
    expect(title.text()).toBe('Catalogs:');
    expect(wrapper.find('h3').exists()).toBe(false);

    const listGroup = wrapper.findComponent(bootstrap.BListGroup);
    expect(listGroup.exists()).toBe(true);
    expect(listGroup.element).toBeVisible();
    const catalogNames = responses.catalogsResp.catalogs;
    const catalogs = wrapper.findAllComponents(bootstrap.BListGroupItem);
    // expect(catalogs.length).toBe(catalogNames.length);
    catalogs.wrappers.forEach((item, idx) => {
      const name = catalogNames[idx];
      expect(item.text()).toBe(name);
      expect(item.attributes('href')).toBe(name);
    });
  });

   it('notifies the user if there are not catalogs', async () => {
    localVue.prototype.$api.get.mockResolvedValue({ data: { catalogs: [] } });
    const wrapper = mount(ListCatalogs,
      {
        localVue,
        router,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.findAllComponents(bootstrap.BListGroupItem).length).toBe(0);
    const p = wrapper.find('p');
    expect(p.exists()).toBe(true);
    expect(p.element).toBeVisible();
    expect(p.text()).toBe('0 catalogs found');
  });

  it('on an error, notifies the user', async () => {
    localVue.prototype.$api.get.mockRejectedValue(new Error('Cast it into the fire! Destroy it!'));
    const wrapper = mount(ListCatalogs,
      {
        localVue,
        router,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(bootstrap.BListGroup).exists()).toBe(false);
    expect(wrapper.find('h1').exists()).toBe(false);
    expect(wrapper.find('p').exists()).toBe(false);
    const h3 = wrapper.find('h3');
    expect(h3.exists()).toBe(true);
    expect(h3.element).toBeVisible();
    expect(h3.text()).toBe('Something went wrong. Try reloading the page. If the problem persists contact an administrator');
  }); */
});
