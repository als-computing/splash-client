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

  it('sends a correct request and displays a list of catalogs', async () => {
    localVue.prototype.$api.get.mockResolvedValue({ data: responses.catalogsResp });
    const wrapper = mount(ListCatalogs,
      {
        localVue,
        router,
        mocks: {
          $store: {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters:
              {
                'login/user': 'Sauron',
              },
          },
        },
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const getMock = localVue.prototype.$api.get;
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).lastCalledWith(wrapper.vm.$runs_url);

    const listGroup = wrapper.findComponent(bootstrap.BListGroup);
    expect(listGroup.exists()).toBe(true);
    const catalogNames = responses.catalogsResp.catalogs;
    const catalogs = wrapper.findAllComponents(bootstrap.BListGroupItem);
    expect(catalogs.length).toBe(catalogNames.length);
    catalogs.wrappers.forEach((item, idx) => {
      const name = catalogNames[idx];
      expect(item.text()).toBe(name);
      expect(item.attributes('href')).toBe(name);
    });
  });
});
