import BootstrapVue from 'bootstrap-vue';
import { mount, /* shallowMount, */ createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import EditFields from '@/components/EditFields.vue';
import * as bootstrap from 'bootstrap-vue';
import marked from 'marked';
import DOMPurify from 'dompurify';
import responses from './compound-responses';


const localVue = createLocalVue();

const propsData = {
  endpoint: 'test_endpoint',
  uid: 'test_uid',
  pathArrays: [['metadata'], ['documentation', 'sections']],
  columnSizes: [3, 9],

};

// TODO: Generalize these tests so that they test both the functionality in the 
// first column and the second column, currently they only test first column

const REQUEST_ENDPOINT = `${propsData.endpoint}/${propsData.uid}`;

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

describe('EditFields component', () => {
  beforeEach(() => {
    localVue.prototype.$api.get.mockClear();
    localVue.prototype.$api.put.mockClear();
  });

  function testDisplay(wrapper, expectedArray) {
    const sectionTitles = wrapper.findAll('strong');
    const markdowns = wrapper.findAll('.markdown-html');
    expect(sectionTitles.length).toBe(markdowns.length);
    expect(sectionTitles.length).toBe(expectedArray.length);
    sectionTitles.wrappers.forEach((elem, i) => {
      expect(elem.text()).toBe(expectedArray[i].title);
      // We're stripping all whitespace from both strings because the whitespace is being inconsistent
      // Ideally we wouldn't have to do this.
      expect(markdowns.at(i).html().replace(/\s/g, '')).toBe(`<div class="markdown-html">${parseMarkDown(expectedArray[i].text)}</div>`.replace(/\s/g, ''));
    });
  }

  function testFieldArrayEquivalency(expectedArray, receivedArray) {
    expect(receivedArray.length).toBe(expectedArray.length);
    receivedArray.forEach((elem, index) => {
      expect(elem.text).toBe(expectedArray[index].text);
      expect(elem.title).toBe(expectedArray[index].title);
    });
  }

  it('sends the correct request to the correct endpoint', async () => {
    localVue.prototype.$api.get.mockResolvedValue(responses.boron);
    const wrapper = mount(EditFields,
      {
        propsData,
        localVue,
      });
    const getMock = localVue.prototype.$api.get;
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).lastCalledWith(REQUEST_ENDPOINT);
  });

  it('displays the document', async () => {
    localVue.prototype.$api.get.mockResolvedValue(responses.boron);
    const wrapper = mount(EditFields,
      {
        propsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const boronData = responses.boron.data;
    const allFields = boronData.metadata.concat(boronData.documentation.sections);
    testDisplay(wrapper, allFields);
  });

  it('sanitizes markdown to prevent against xss attacks', async () => {
    localVue.prototype.$api.get.mockResolvedValue(responses.xss_attack);
    const wrapper = mount(EditFields,
      {
        propsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const dangerMD = wrapper.findAll('.markdown-html').at(1);
    // Test to ensure that it is stripped of the script tag
    expect(dangerMD.html()).toBe('<div class="markdown-html">\n  <p>DANGEROUS MARKDOWN</p>\n</div>');
  });

  it('sends the correct axios request when save is pressed', async () => {
    const mockPut = localVue.prototype.$api.put;
    /* ALERT ALERT!!! There is a HUGE gotcha here. the vue component edits the object passed to
    it directly thus affecting all references to that object EVEN IN THE FREAKING TEST. So that's
    why I need to use JSON.parse(JSON.stringify()) to deep clone the object. However, keep in mind that
    any references to this object will change. Like for example if vue were to pass
    this object to a mock function, and then edit it afterwards, the object would change even
    in the mock.calls array for that mock function!!!!! */
    localVue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(responses.boron)));
    mockPut.mockResolvedValue({ uid: 'test_uid' });
    const wrapper = mount(EditFields,
      {
        propsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const section = wrapper.find('.markdown-html');
    await section.trigger('dblclick');
    const titleArea = wrapper.findComponent(bootstrap.BFormInput);
    const textArea = wrapper.findComponent(bootstrap.BFormTextarea);
    titleArea.element.value = 'One ring to rule them all';
    // this ensures v-model updates
    await titleArea.trigger('input');
    textArea.element.value = 'One ring to find them.';
    // this ensures v-model updates
    await textArea.trigger('input');
    const buttons = wrapper.findAllComponents(bootstrap.BButton);
    console.log(buttons.length);
    const save = buttons.wrappers.find((elem) => elem.text() === 'Save');
    await wrapper.vm.$nextTick();
    await save.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(mockPut).toBeCalledTimes(1);
    const url = mockPut.mock.calls[0][0];
    expect(url).toBe(REQUEST_ENDPOINT);
    const request = mockPut.mock.calls[0][1];

    const boronData = responses.boron.data;

    const expectedMetadataArray = [...boronData.metadata];
    expectedMetadataArray[0] = { title: 'One ring to rule them all', text: 'One ring to find them.' };

    testFieldArrayEquivalency(expectedMetadataArray, request.metadata);
    testFieldArrayEquivalency(boronData.documentation.sections, request.documentation.sections);

    const expectedValues = request.metadata.concat(request.documentation.sections);
    testDisplay(wrapper, expectedValues);
  });

  it('sends no request when cancel is pressed', async () => {
    const mockPut = localVue.prototype.$api.put;
    /* ALERT ALERT!!! There is a HUGE gotcha here. the vue component edits the object passed to
    it directly thus affecting all references to that object EVEN IN THE FREAKING TEST. So that's
    why I need to use JSON.parse(JSON.stringify()) to deep clone the object. However, keep in mind that
    any references to this object will change. Like for example if vue were to pass
    this object to a mock function, and then edit it afterwards, the object would change even
    in the mock.calls array for that mock function!!!!! */
    localVue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(responses.boron)));
    mockPut.mockResolvedValue({ uid: 'test_uid' });
    const wrapper = mount(EditFields,
      {
        propsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const section = wrapper.find('.markdown-html');
    await section.trigger('dblclick');
    const titleArea = wrapper.findComponent(bootstrap.BFormInput);
    const textArea = wrapper.findComponent(bootstrap.BFormTextarea);
    titleArea.element.value = 'One ring to rule them all';
    // this ensures v-model updates
    await titleArea.trigger('input');
    textArea.element.value = 'One ring to find them.';
    // this ensures v-model updates
    await textArea.trigger('input');
    const buttons = wrapper.findAllComponents(bootstrap.BButton);
    console.log(buttons.length);
    const cancel = buttons.wrappers.find((elem) => elem.text() === 'Cancel');
    await cancel.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(mockPut).toBeCalledTimes(0);
    testDisplay(wrapper, responses.boron.data.metadata.concat(responses.boron.data.documentation.sections));
  });

  it('sends the correct axios requests when interacting with delete section functionality', async () => {
    const mockPut = localVue.prototype.$api.put;
    /* ALERT ALERT!!! There is a HUGE gotcha here. the vue component edits the object passed to
    it directly thus affecting all references to that object EVEN IN THE FREAKING TEST. So that's
    why I need to use JSON.parse(JSON.stringify()) to deep clone the object. This ensures that
    the imported object isn't changed. However, keep in mind that
    any references to this object will change. Like for example if vue were to pass
    this object to a mock function, and then edit it afterwards, the object would change even
    in the mock.calls array for that mock function!!!!! */
    localVue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(responses.boron)));
    mockPut.mockResolvedValue({ uid: 'test_uid' });


    const wrapper = mount(EditFields,
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


    let section = wrapper.find('.markdown-html');
    await section.trigger('dblclick');

    let buttons = wrapper.findAllComponents(bootstrap.BButton);
    let deleteButton = buttons.wrappers.find((elem) => elem.text() === 'Delete row');
    await deleteButton.trigger('click');

    expect(mockConfirmation).toBeCalledWith(
      "Are you sure you want to delete this row? This can't be undone.",
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

    expect(mockPut).toBeCalledTimes(0);

    // Mock the 'Yes' button being pressed
    mockConfirmation.mockResolvedValue(true);

    section = wrapper.find('.markdown-html');
    await section.trigger('dblclick');

    testDisplay(wrapper, responses.boron.data.metadata.concat(responses.boron.data.documentation.sections));

    buttons = wrapper.findAllComponents(bootstrap.BButton);
    deleteButton = buttons.wrappers.find((elem) => elem.text() === 'Delete row');
    await deleteButton.trigger('click');


    expect(mockConfirmation).toBeCalledWith(
      "Are you sure you want to delete this row? This can't be undone.",
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

    expect(mockPut).toBeCalledTimes(1);
    const url = mockPut.mock.calls[0][0];
    expect(url).toBe(REQUEST_ENDPOINT);
    const request = mockPut.mock.calls[0][1];
    const originalBoronData = responses.boron.data;
    // TODO: Test that the entire request matches, not just this element

    const expectedMetadataArray = originalBoronData.metadata.slice(1);
    testFieldArrayEquivalency(expectedMetadataArray, request.metadata);
    testFieldArrayEquivalency(originalBoronData.documentation.sections, request.documentation.sections);

    testDisplay(wrapper, request.metadata.concat(request.documentation.sections));
    mockConfirmation.mockRestore();

    // TODO: Test that UI updates after axios request is sent
  });

  it('sends the correct axios requests when interacting with the add section functionality', async () => {
    const mockPut = localVue.prototype.$api.put;
    /* ALERT ALERT!!! There is a HUGE gotcha here. the vue component edits the object passed to
    it directly thus affecting all references to that object EVEN IN THE FREAKING TEST. So that's
    why I need to use JSON.parse(JSON.stringify()) to deep clone the object. However, keep in mind that
    any references to this object will change. Like for example if vue were to pass
    this object to a mock function, and then edit it afterwards, the object would change even
    in the mock.calls array for that mock function!!!!! */

    localVue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(responses.boron)));
    mockPut.mockResolvedValue({ uid: 'test_uid' });
    const wrapper = mount(EditFields,
      {
        propsData,
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    async function triggerInput(index) {
      const buttons = wrapper.findAllComponents(bootstrap.BButton);

      let timesAppeared = 0;

      const addSection = buttons.wrappers.find(
        (elem) => {
          if ((elem.text() === 'Add row') && (timesAppeared === index)) {
            return true;
          }
          if (elem.text() === 'Add row') {
            timesAppeared += 1;
          }
          return false;
        },
      );
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
    let buttons = wrapper.findAllComponents(bootstrap.BButton);
    const cancel = buttons.wrappers.find((elem) => elem.text() === 'Cancel');

    await cancel.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(mockPut).toBeCalledTimes(0);
    testDisplay(wrapper, responses.boron.data.metadata.concat(responses.boron.data.documentation.sections));

    await triggerInput(0);
    buttons = wrapper.findAllComponents(bootstrap.BButton);
    let save = buttons.wrappers.find((elem) => elem.text() === 'Save');

    await save.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(mockPut).toBeCalledTimes(1);


    let url = mockPut.mock.calls[0][0];
    expect(url).toBe(REQUEST_ENDPOINT);
    let request = mockPut.mock.calls[0][1];

    let expectedMetadataArray = [...responses.boron.data.metadata];
    expectedMetadataArray.splice(0, 0, { title: 'One ring to rule them all', text: 'One ring to find them.' });
    testFieldArrayEquivalency(expectedMetadataArray, request.metadata);

    let expectedSectionsArray = responses.boron.data.documentation.sections;
    testFieldArrayEquivalency(expectedSectionsArray, request.documentation.sections);

    testDisplay(wrapper, expectedMetadataArray.concat(expectedSectionsArray));

    // We have to test one of the other buttons as well, because
    // the first one is different than the other ones.

    await triggerInput(1);
    buttons = wrapper.findAllComponents(bootstrap.BButton);
    save = buttons.wrappers.find((elem) => elem.text() === 'Save');

    await save.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(mockPut).toBeCalledTimes(2);


    url = mockPut.mock.calls[1][0];
    expect(url).toBe(REQUEST_ENDPOINT);
    request = mockPut.mock.calls[1][1];

    expectedMetadataArray.splice(1, 0, { title: 'One ring to rule them all', text: 'One ring to find them.' });
    testFieldArrayEquivalency(expectedMetadataArray, request.metadata);

    expectedSectionsArray = responses.boron.data.documentation.sections;
    testFieldArrayEquivalency(expectedSectionsArray, request.documentation.sections);

    testDisplay(wrapper, expectedMetadataArray.concat(expectedSectionsArray));
  });
});
