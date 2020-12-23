import BootstrapVue from 'bootstrap-vue';
import { mount, createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import Page from '@/views/Page.vue';
import EditContent from '@/components/editor/EditContent.vue';
import DocumentUpdater from '@/components/editor/DocumentUpdater';
import mockDocumentUpdater from '../../moduleMocks/documentUpdaterMock';

jest.mock('@/components/editor/DocumentUpdater', () => jest.fn().mockImplementation(() => (mockDocumentUpdater.mock)));


const localVue = createLocalVue();

localVue.use(BootstrapVue);
localVue.use({
  install(Vue) {
    Vue.prototype.$pages_url = 'test_url';
    Vue.prototype.$route = { params: { uid: 'test_uid' } };
  },
});

const mockData = mockDocumentUpdater.data;
const mockUpdater = mockDocumentUpdater.mock;

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

const wrapper = mount(Page,
  {
    localVue,
  });

describe('Page View', () => {


  it('constructs and then initializes the DocumentUpdater class', async () => {
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(DocumentUpdater).toBeCalledWith(localVue.prototype.$pages_url, localVue.prototype.$route.params.uid);
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
