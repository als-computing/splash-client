import BootstrapVue from 'bootstrap-vue';
import { mount, createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import PageEditing from '@/views/PageEditing.vue';
import EditContent from '@/components/editor/EditContent.vue';
import EditFields from '@/components/editor/EditFields.vue';
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

const metadataProps = {
  sectionsArray: mockData.metadata,
  emptyMessage: 'No fields found. Be the first to add some.',
  removeButtonText: 'Delete field',
  addButtonText: 'Add field',
  titleInputName: 'Name',
  valueInputName: 'Value',
  deleteConfirmationMessage: "Are you sure you want to delete this field? This can't be undone.",
};

const documentationProps = {
  documentation: mockData.documentation,
};

localVue.prototype.$api.get.mockResolvedValue({ data: { number: 4 } });

let wrapper = mount(PageEditing,
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

describe('PageEditing View', () => {
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

  it('passes correct props to edit-content and edit-field components', async () => {
    const fieldsEditor = wrapper.findComponent(EditFields);
    Object.keys(metadataProps).forEach((key) => {
      if (typeof metadataProps[key] === 'object') expect(metadataProps[key]).toEqual(fieldsEditor.props(key));

      else expect(metadataProps[key]).toBe(fieldsEditor.props(key));
    });
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
    error.response = { status: 412, data: { err: 'etag_mismatch_error', etag: 'test_etag' } };
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
    const fieldsEditor = wrapper.findComponent(EditFields);
    await testEmittedEvents(wrapper, fieldsEditor, '', 'metadata', [{ title: 'hello', text: 'hello' }], undefined);
    // We remount here, because testing the etag error will cause the wrapper to not call
    // updateDataProperty automatically
    wrapper = mount(PageEditing,
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
