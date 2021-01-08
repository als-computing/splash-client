import BootstrapVue from 'bootstrap-vue';
import { mount, createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import PageEditing from '@/views/PageEditing.vue';
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

const metadataProps = {
  sectionsArray: mockData.metadata,
  markdown: false,
  emptyMessage: 'No fields found. Be the first to add some.',
  removeButtonText: 'Delete field',
  addButtonText: 'Add field',
  titleInputName: 'Name',
  valueInputName: 'Value',
  deleteConfirmationMessage: "Are you sure you want to delete this field? This can't be undone.",
};

const documentationProps = {
  sectionsArray: mockData.documentation.sections,
  markdown: true,
  emptyMessage: 'No documentation found. Be the first to add some.',
  removeButtonText: 'Delete section',
  addButtonText: 'Add section',
  titleInputName: 'Title',
  valueInputName: 'Documentation',
  deleteConfirmationMessage: "Are you sure you want to delete this section? This can't be undone.",
};

localVue.prototype.$api.get.mockResolvedValue({ data: { number: 4 } });

const wrapper = mount(PageEditing,
  {
    localVue,
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

  it('passes correct props to both edit-content components', async () => {
    const editors = wrapper.findAllComponents(EditContent);
    Object.keys(metadataProps).forEach((key) => {
      if (typeof metadataProps[key] === 'object') expect(metadataProps[key]).toEqual(editors.at(0).props(key));

      else expect(metadataProps[key]).toBe(editors.at(0).props(key));
    });

    Object.keys(documentationProps).forEach((key) => {
      if (typeof documentationProps[key] === 'object') expect(documentationProps[key]).toEqual(editors.at(1).props(key));

      else expect(documentationProps[key]).toBe(editors.at(1).props(key));
    });
    // const title = wrapper.find('h1');
    // expect(title.text()).toBe(mockData.title);
  });


  async function testEmittedEvents(appWrapper, editor, expectedPath, expectedKey) {
    const newSections = [{ title: 'hello', text: 'hello' }];
    mockUpdater.updateDataProperty.mockRejectedValue(new Error('Test'));
    const callback = jest.fn();

    editor.vm.$emit('dataToParent', {
      data: newSections,
      callback,
    });

    await appWrapper.vm.$nextTick();
    await appWrapper.vm.$nextTick();

    expect(mockUpdater.updateDataProperty).toHaveBeenCalledWith(
      expectedPath, expectedKey, newSections,
    );
    expect(callback).toHaveBeenCalledWith(false);

    mockUpdater.updateDataProperty.mockResolvedValue();

    editor.vm.$emit('dataToParent', {
      data: newSections,
      callback,
    });
    await appWrapper.vm.$nextTick();
    await appWrapper.vm.$nextTick();
    expect(mockUpdater.updateDataProperty).toHaveBeenCalledWith(
      expectedPath, expectedKey, newSections,
    );
    expect(callback).toHaveBeenCalledWith(true);
  }


  it('calls correct update methods on emitted events', async () => {
    const editors = wrapper.findAllComponents(EditContent);
    const metadataEditor = editors.at(0);

    await testEmittedEvents(wrapper, metadataEditor, '', 'metadata');

    const docEditor = editors.at(1);
    await testEmittedEvents(wrapper, docEditor, 'documentation', 'sections');
  });
});
