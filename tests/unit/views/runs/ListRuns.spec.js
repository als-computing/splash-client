import BootstrapVue from 'bootstrap-vue';
import VueRouter from 'vue-router';
import routes from '@/routes.js';
import { mount, /* shallowMount, */ createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import ListRuns from '@/views/runs/ListRuns.vue';
import * as bootstrap from 'bootstrap-vue';

const localVue = createLocalVue();

localVue.use(BootstrapVue);
localVue.use(VueRouter);
localVue.use({
  install(Vue) {
    Vue.prototype.$api = mockAxios.create();
    Vue.prototype.$runs_url = 'runs';
  },
});

describe('List runs component', () => {
  beforeEach(() => {
    localVue.prototype.$api.get.mockClear();
  });
  const router = new VueRouter({ routes });
  // TODO: Test cases where no catalogs are returned and
  // Where there is some sort of error

  it('does not render certain components while waiting for request', async () => {
    localVue.prototype.$api.get.mockResolvedValue({});
    const wrapper = mount(ListRuns,
      {
        localVue,
        router,
      });
    // This tests while waiting for the request because
    // nextTick must be called
    expect(wrapper.findComponent(bootstrap.BListGroup).exists()).toBe(false);
    expect(wrapper.find('h1').exists()).toBe(false);
    expect(wrapper.findComponent(bootstrap.BButton).exists()).toBe(false);
    expect(wrapper.find('h3').exists()).toBe(false);
    expect(wrapper.find('p').exists()).toBe(false);
  });

  /* it('sends correct request and lists runs', async () => {
    localVue.prototype.$api.get.mockResolvedValue({ data: responses.runsResp });
    const wrapper = mount(ListRuns,
      {
        localVue,
        router,
      });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('p').exists()).toBe(false);
    const getMock = localVue.prototype.$api.get;
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).lastCalledWith(wrapper.vm.$runs_url);

    const title = wrapper.find('h1');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Catalogs:');
    expect(wrapper.find('h3').exists()).toBe(false);

    const listGroup = wrapper.findComponent(bootstrap.BListGroup);
    expect(listGroup.exists()).toBe(true);
    expect(listGroup.element).toBeVisible();
    const catalogNames = responses.catalogsResp.catalogs;
    const catalogs = wrapper.findAllComponents(bootstrap.BListGroupItem);
    expect(catalogs.length).toBe(catalogNames.length);
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
