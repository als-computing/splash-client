import BootstrapVue from 'bootstrap-vue';
import { mount, createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import Page from '@/views/Page.vue';
import EditContent from '@/components/editor/EditContent.vue';
import PageUpdater from '@/components/editor/PageUpdater';
import mockPageUpdater from '../../moduleMocks/pageUpdaterMock';

jest.mock('@/components/editor/PageUpdater', () => jest.fn().mockImplementation(() => (mockPageUpdater.mock)));

const localVue = createLocalVue();

localVue.use(BootstrapVue);
localVue.use({
  install(Vue) {
    Vue.prototype.$pages_url = 'test_url';
    Vue.prototype.$api = mockAxios.create();
  },
});

const mockData = mockPageUpdater.data;
const mockUpdater = mockPageUpdater.mock;

const documentationProps = {
  documentation: mockData.documentation,
};

localVue.prototype.$api.get.mockResolvedValue({ data: { number: 4 } });

let wrapper = mount(Page,
  {
    localVue,
    stubs: {
      'additional-references': true,
    },
    mocks: {
      $route: {
        params: { uid: 'test_uid' },
        query: {},
      },
    },
  });

describe('Page View', () => {
  // it('retrieves number of versions', async () => {
  //  await wrapper.vm.$nextTick();
  //  await wrapper.vm.$nextTick();
  //  expect(wrapper.vm.$api.get).toBeCalledWith(`${wrapper.vm.$pages_url}/num_versions/${wrapper.vm.$route.params.uid}`);
  // });
  it('constructs and then initializes the PageUpdater class', async () => {
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(PageUpdater).toBeCalledWith(localVue.prototype.$pages_url, wrapper.vm.$route.params.uid);
    expect(mockUpdater.init).toBeCalledTimes(1);
  });

  it('passes correct props to edit-content component', async () => {
    const contentEditor = wrapper.findComponent(EditContent);
    Object.keys(documentationProps).forEach((key) => {
      if (typeof documentationProps[key] === 'object') expect(contentEditor.props(key)).toEqual(documentationProps[key]);

      else expect(contentEditor.props(key)).toBe(documentationProps[key]);
    });
    // const title = wrapper.find('h1');
    // expect(title.text()).toBe(mockData.title);
  });

  async function testEmittedEvents(appWrapper, editor, expectedPath, expectedKey, testData, expectedEtag) {
    let error = new Error('Test');
    error.response = { status: 500, data: { err: 'something went wrong' } };
    mockUpdater.updateDataProperty.mockRejectedValue(error);
    const callback = jest.fn();

    editor.vm.$emit('dataToParent', {
      data: testData,
      callback,
    });

    await appWrapper.vm.$nextTick();
    await appWrapper.vm.$nextTick();
    await appWrapper.vm.$nextTick();
    await appWrapper.vm.$nextTick();

    expect(mockUpdater.updateDataProperty).toHaveBeenCalledWith(
      expectedPath, expectedKey, testData, expectedEtag,
    );
    expect(callback).toHaveBeenCalledWith({ displayMessage: true, success: false });

    mockUpdater.updateDataProperty.mockResolvedValue();

    editor.vm.$emit('dataToParent', {
      data: testData,
      callback,
    });
    await appWrapper.vm.$nextTick();
    await appWrapper.vm.$nextTick();
    expect(mockUpdater.updateDataProperty).toHaveBeenCalledWith(
      expectedPath, expectedKey, testData, expectedEtag,
    );
    expect(callback).toHaveBeenCalledWith({ success: true });

    // Test that on 412 etag errors we pass the correct argument
    error = new Error('412 axios error');
    error.response = { status: 412, data: { err: 'etag_mismatch_error', etag: 'test_etag', splash_md: { archived: false } } };
    mockUpdater.updateDataProperty.mockRejectedValue(error);

    editor.vm.$emit('dataToParent', {
      data: testData,
      callback,
    });
    await appWrapper.vm.$nextTick();
    await appWrapper.vm.$nextTick();
    expect(mockUpdater.updateDataProperty).toHaveBeenCalledWith(
      expectedPath, expectedKey, testData, expectedEtag,
    );
    expect(callback).toHaveBeenCalledWith({ success: false, displayMessage: false });
  }

  it('calls correct update methods on emitted events', async () => {
    // We remount here, because testing the etag error will cause the wrapper to not call
    // updateDataProperty automatically
    wrapper = mount(Page,
      {
        localVue,
        stubs: {
          'additional-references': true,
        },
        mocks: {
          $route: {
            params: { uid: 'test_uid' },
            query: {},
          },
        },
      });
    await wrapper.vm.$nextTick();
    const contentEditor = wrapper.findComponent(EditContent);
    await testEmittedEvents(wrapper, contentEditor, '', 'documentation', 'SAMPLE MARKDOWN', undefined);
  });
});
