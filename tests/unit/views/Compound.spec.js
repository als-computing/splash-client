import BootstrapVue from 'bootstrap-vue';
import { mount, createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import Compound from '@/views/Compound.vue';
import EditFields from '@/components/EditFields.vue';
import responses from '../components/compound-responses';


const localVue = createLocalVue();


// TODO: Generalize these tests so that they test both the functionality in the
// first column and the second column, currently they only test first column

localVue.use(BootstrapVue);
localVue.use({
  install(Vue) {
    Vue.prototype.$compounds_url = 'test_url';
    Vue.prototype.$route = { params: { uid: 'test_uid' } };
    Vue.prototype.$api = mockAxios.create();
  },
});

const PATH_ARRAYS = [['metadata'], ['documentation', 'sections']];


describe('Compound View', () => {
  beforeEach(() => {
    localVue.prototype.$api.get.mockClear();
    localVue.prototype.$api.put.mockClear();
  });


  it('mounts the EditFields component with correct props', async () => {
    localVue.prototype.$api.get.mockResolvedValue(responses.boron);
    const wrapper = mount(Compound,
      {
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const editor = wrapper.findComponent(EditFields);
    expect(editor.element).toBeVisible();
    expect(editor.props().pathArrays).toEqual(PATH_ARRAYS);
    expect(editor.props().uid).toBe(localVue.prototype.$route.params.uid);
    expect(editor.props().endpoint).toBe(localVue.prototype.$compounds_url);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const title = wrapper.find('h1');
    expect(title.text()).toBe(responses.boron.data.species);
  });
});
