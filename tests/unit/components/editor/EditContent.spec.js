import BootstrapVue from 'bootstrap-vue';
import { mount, /* shallowMount, */ createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import EditContent from '@/components/editor/EditContent.vue';
import * as bootstrap from 'bootstrap-vue';
import marked from 'marked';
import DOMPurify from 'dompurify';
import responses from '../../../responses/compound-responses';


const localVue = createLocalVue();

const noMarkdownPropsData = {
  sectionsArray: responses.boron.data.metadata,
  markdown: false,
  emptyMessage: 'No fields found. Be the first to add some.',
  removeButtonText: 'Delete field',
  addButtonText: 'Add field',
  titleInputName: 'Name',
  valueInputName: 'Value',
  deleteConfirmationMessage: "Are you sure you want to delete this field? This can't be undone.",
};

const propsData = {
  sectionsArray: responses.boron.data.documentation.sections,
  markdown: true,
  emptyMessage: 'No fields found. Be the first to add some.',
  removeButtonText: 'Delete field',
  addButtonText: 'Add field',
  titleInputName: 'Name',
  valueInputName: 'Value',
  deleteConfirmationMessage: "Are you sure you want to delete this field? This can't be undone.",
};

// TODO We need to implement testing for when there are errors to ensure
// that the UI continues to display the data that's in the database, and not the new stuff
// that hasn't been saved

// TODO:implement testing to make sutre that you can't press any of the editing buttons
// while the parent component is saving the data

localVue.use(BootstrapVue);
localVue.use({
  install(Vue) {
    Vue.prototype.$api = mockAxios.create();
  },
});

function parseMarkDown(markdown) {
  const html = marked(markdown);
  return DOMPurify.sanitize(html);
}

describe('EditContent component', () => {
  beforeEach(() => {
    localVue.prototype.$api.get.mockClear();
    localVue.prototype.$api.put.mockClear();
  });

  function testDisplay(wrapper, expectedArray, markdown) {
    let isMarkdown = markdown;
    if (isMarkdown === undefined) isMarkdown = true;
    const sectionTitles = wrapper.findAll('h4');
    const markdowns = wrapper.findAll('.user-text');
    expect(sectionTitles.length).toBe(markdowns.length);
    expect(sectionTitles.length).toBe(expectedArray.length);
    sectionTitles.wrappers.forEach((elem, i) => {
      expect(elem.element).toBeVisible();
      expect(markdowns.at(i).element).toBeVisible();
      expect(elem.text()).toBe(expectedArray[i].title);
      // We're stripping all whitespace from both strings because the whitespace is being inconsistent
      // Ideally we wouldn't have to do this.
      expect(markdowns.at(i).html().replace(/\s/g, '')).toBe(`<div class="user-text">${isMarkdown ? parseMarkDown(expectedArray[i].text) : expectedArray[i].text}</div>`.replace(/\s/g, ''));
    });
  }
  
  async function findButton(wrapper, text, index) {
    const buttons = wrapper.findAllComponents(bootstrap.BButton);
    let currentIndex = 0;
    const button = buttons.wrappers.find((elem) => {
      if (elem.text() === text && currentIndex === index) return true;
      if (elem.text() === text) currentIndex += 1;
      return false;
    });
    return button;
  }

  /* it('displays the document without markdown', async () => {
    const wrapper = mount(EditContent,
      {
        propsData: noMarkdownPropsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    testDisplay(wrapper, noMarkdownPropsData.sectionsArray, false);
  }); */

  /* it('displays document using markdown', async () => {
    const wrapper = mount(EditContent,
      {
        propsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    testDisplay(wrapper, propsData.sectionsArray, true);
  }); */

  it('sanitizes markdown to prevent against xss attacks', async () => {
    const wrapper = mount(EditContent,
      {
        propsData: {
          sectionsArray: responses.xss_attack.data.documentation.sections,
          markdown: true,
        },
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const dangerMD = wrapper.findAll('.user-text').at(0);
    // Test to ensure that it is stripped of the script tag
    expect(dangerMD.html()).toBe('<div class="user-text">\n  <p>DANGEROUS MARKDOWN</p>\n</div>');
  });

  /* it('emits correctly when save is pressed', async () => {
    const wrapper = mount(EditContent,
      {
        propsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const section = wrapper.find('.user-text');
    await section.trigger('dblclick');
    const titleArea = wrapper.findComponent(bootstrap.BFormInput);
    const textArea = wrapper.findComponent(bootstrap.BFormTextarea);
    titleArea.element.value = 'One ring to rule them all';
    // this ensures v-model updates
    await titleArea.trigger('input');
    textArea.element.value = 'One ring to find them.';
    // this ensures v-model updates
    await textArea.trigger('input');
    const saveButton = await findButton(wrapper, 'Save', 0);
    await saveButton.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const expectedFieldsArray = [...propsData.sectionsArray];
    expectedFieldsArray[0] = { title: 'One ring to rule them all', text: 'One ring to find them.' };
    const eventObj = wrapper.emitted().dataToParent[0][0];
    expect(eventObj.data).toEqual(expectedFieldsArray);
    eventObj.callback(true);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    testDisplay(wrapper, expectedFieldsArray);
    // TODO test what happens if there is a database error
  }); */

  /* it('emits nothing when cancel is pressed', async () => {
    const wrapper = mount(EditContent,
      {
        propsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const section = wrapper.find('.user-text');
    await section.trigger('dblclick');
    const titleArea = wrapper.findComponent(bootstrap.BFormInput);
    const textArea = wrapper.findComponent(bootstrap.BFormTextarea);
    titleArea.element.value = 'One ring to rule them all';
    // this ensures v-model updates
    await titleArea.trigger('input');
    textArea.element.value = 'One ring to find them.';
    // this ensures v-model updates
    await textArea.trigger('input');

    const cancel = await findButton(wrapper, 'Cancel', 0);
    await cancel.trigger('click');

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()).toEqual({});
    testDisplay(wrapper, propsData.sectionsArray);
  }); */

  /* it('sends the correct axios requests when interacting with delete section functionality', async () => {
    const wrapper = mount(EditContent,
      {
        propsData,
        localVue,
      });

    // In order to test a bootstrap modal it needs to have the property static set to true
    //  https://stackoverflow.com/a/58539818/8903570, however this is not supported when
    // programatically rendering a b-modal, so I am only mocking the method
    //  that programatically renders and ensuring the correct behavior
    // is followed based on its return value

    const mockConfirmation = jest.spyOn(wrapper.vm.$bvModal, 'msgBoxConfirm');

    // Mock the 'No' button being pressed
    mockConfirmation.mockResolvedValue(false);

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();


    let section = wrapper.find('.user-text');
    await section.trigger('dblclick');

    let deleteButton = await findButton(wrapper, propsData.removeButtonText, 0);
    await deleteButton.trigger('click');

    expect(mockConfirmation).toBeCalledWith(
      propsData.deleteConfirmationMessage,
      {
        title: 'Please Confirm',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      },
    );
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()).toEqual({});

    const cancelButton = await findButton(wrapper, 'Cancel', 0);
    await cancelButton.trigger('click');

    testDisplay(wrapper, propsData.sectionsArray);

    // Mock the 'Yes' button being pressed
    mockConfirmation.mockResolvedValue(true);

    section = wrapper.find('.user-text');
    await section.trigger('dblclick');


    deleteButton = await findButton(wrapper, propsData.removeButtonText, 0);
    await deleteButton.trigger('click');

    expect(mockConfirmation).toBeCalledWith(
      propsData.deleteConfirmationMessage,
      {
        title: 'Please Confirm',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      },
    );
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const eventObj = wrapper.emitted().dataToParent[0][0];

    const expectedFieldsArray = propsData.sectionsArray.slice(1);

    expect(eventObj.data).toEqual(expectedFieldsArray);

    eventObj.callback(true);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    testDisplay(wrapper, expectedFieldsArray);
    mockConfirmation.mockRestore();

    // TODO test UI on a database error
  }); */

  /* it('emits correctly when interacting with the add section functionality', async () => {
    const wrapper = mount(EditContent,
      {
        propsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    // TODO test to make sure that you can't add another section by pressing
    // the plus button when there is already a new one open

    async function triggerInput(index) {
      const addSection = wrapper.findAllComponents(bootstrap.BIconPlusCircleFill).at(index);
      await addSection.trigger('click');

      const titleArea = wrapper.findComponent(bootstrap.BFormInput);
      const textArea = wrapper.findComponent(bootstrap.BFormTextarea);

      titleArea.element.value = 'One ring to rule them all';
      // this ensures v-model updates
      await titleArea.trigger('input');
      textArea.element.value = 'One ring to find them.';
      // this ensures v-model updates
      await textArea.trigger('input');
    }

    await triggerInput(0);
    const cancel = await findButton(wrapper, 'Cancel', 0);

    await cancel.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()).toEqual({});
    testDisplay(wrapper, propsData.sectionsArray);

    await triggerInput(0);
    let save = await findButton(wrapper, 'Save', 0);

    await save.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    let eventObj = wrapper.emitted().dataToParent[0][0];
    const expectedFieldsArray = [...propsData.sectionsArray];
    expectedFieldsArray.splice(0, 0, { title: 'One ring to rule them all', text: 'One ring to find them.' });
    expect(eventObj.data).toEqual(expectedFieldsArray);
    eventObj.callback(true);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    testDisplay(wrapper, expectedFieldsArray);

    // TODO test what happens on database error

    // We have to test one of the other buttons as well, because
    // the first one is different than the other ones.

    await triggerInput(1);
    save = await findButton(wrapper, 'Save', 0);

    await save.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    eventObj = wrapper.emitted().dataToParent[1][0];

    eventObj.callback(true);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expectedFieldsArray.splice(1, 0, { title: 'One ring to rule them all', text: 'One ring to find them.' });

    testDisplay(wrapper, expectedFieldsArray);

    // TODO test what happens on database error
  }); */
});
