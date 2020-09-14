import BootstrapVue from 'bootstrap-vue';
import { mount, /* shallowMount, */ createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import Compound from '@/views/Compound.vue';
import ReadFields from '@/components/ReadFields.vue';
import * as bootstrap from 'bootstrap-vue';
import marked from 'marked';
import DOMPurify from 'dompurify';
import responses from './compound-responses';


const localVue = createLocalVue();

localVue.use(BootstrapVue);
localVue.use({
  install(Vue) {
    Vue.prototype.$api = mockAxios.create();
    Vue.prototype.$compounds_url = 'compounds';
    Vue.prototype.$route = { params: { uid: 'test_uid' } };
  },
});

function parseMarkDown(markdown) {
  const html = marked(markdown);
  return DOMPurify.sanitize(html);
}

describe('Compound component', () => {
  beforeEach(() => {
    localVue.prototype.$api.get.mockClear();
    localVue.prototype.$api.put.mockClear();
  });

  it('sends the correct request to the correct endpoint', async () => {
    localVue.prototype.$api.get.mockResolvedValue(responses.boron);
    mount(Compound,
      {
        localVue,
      });
    const getMock = localVue.prototype.$api.get;
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).lastCalledWith(`${localVue.prototype.$compounds_url}/${localVue.prototype.$route.params.uid}`);
  });

  it('displays the document', async () => {
    localVue.prototype.$api.get.mockResolvedValue(responses.boron);
    const wrapper = mount(Compound,
      {
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const boron = responses.boron.data;
    const title = wrapper.find('h1');
    expect(title.text()).toBe(boron.species);
    const sectionTitles = wrapper.findAll('strong');
    const markdowns = wrapper.findAll('.markdown-html');
    boron.documentation.sections.forEach((elem, i) => {
      expect(sectionTitles.at(i).text()).toBe(elem.title);
      // We're stripping all whitespace from both strings because the whitespace is being inconsistent
      // Ideally we wouldn't have to do this.
      expect(markdowns.at(i).html().replace(/\s/g, '')).toBe(`<div class="markdown-html">${parseMarkDown(elem.text)}</div>`.replace(/\s/g, ''));
    });

    const fieldReader = wrapper.findComponent(ReadFields);
    const items = fieldReader.findAll(bootstrap.BListGroupItem); 

    boron.metadata.forEach((elem, index) => {
      expect(items.wrappers[index].text()).toContain(elem.name);
      expect(items.wrappers[index].find('h5').text()).toBe(elem.value);
    });
  });

  it('sanitizes markdown to prevent against xss attacks', async () => {
    localVue.prototype.$api.get.mockResolvedValue(responses.xss_attack);
    const wrapper = mount(Compound,
      {
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const dangerMD = wrapper.find('.markdown-html');
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
    const wrapper = mount(Compound,
      {
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
    expect(url).toBe(`${localVue.prototype.$compounds_url}/${localVue.prototype.$route.params.uid}`);
    const request = mockPut.mock.calls[0][1];
    expect(request.documentation.sections[0].title).toBe('One ring to rule them all');
    expect(request.documentation.sections[0].text).toBe('One ring to find them.');
    // TODO: Test that UI is updated as well after the request is sent
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
    const wrapper = mount(Compound,
      {
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


    const wrapper = mount(Compound,
      {
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
    let deleteButton = buttons.wrappers.find((elem) => elem.text() === 'Delete Section');
    await deleteButton.trigger('click');

    expect(mockConfirmation).toBeCalledWith(
      "Are you sure you want to delete this section? This can't be undone.",
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

    buttons = wrapper.findAllComponents(bootstrap.BButton);
    deleteButton = buttons.wrappers.find((elem) => elem.text() === 'Delete Section');
    await deleteButton.trigger('click');

    expect(mockConfirmation).toBeCalledWith(
      "Are you sure you want to delete this section? This can't be undone.",
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
    expect(url).toBe(`${localVue.prototype.$compounds_url}/${localVue.prototype.$route.params.uid}`);
    const request = mockPut.mock.calls[0][1];
    const originalBoronSections = responses.boron.data.documentation.sections;
    expect(request.documentation.sections.length).toBe(originalBoronSections.length - 1);
    expect(request.documentation.sections[0].title).toBe(originalBoronSections[1].title);
    expect(request.documentation.sections[0].text).toBe(originalBoronSections[1].text);
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
    const wrapper = mount(Compound,
      {
        localVue,
      });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    async function triggerInput(index) {
      const buttons = wrapper.findAllComponents(bootstrap.BButton);

      let timesAppeared = 0;

      const addSection = buttons.wrappers.find(
        (elem) => {
          if ((elem.text() === 'Add section') && (timesAppeared === index)) {
            return true;
          }
          if (elem.text() === 'Add section') {
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

    await triggerInput(0);
    buttons = wrapper.findAllComponents(bootstrap.BButton);
    let save = buttons.wrappers.find((elem) => elem.text() === 'Save');

    await save.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(mockPut).toBeCalledTimes(1);


    let url = mockPut.mock.calls[0][0];
    expect(url).toBe(`${localVue.prototype.$compounds_url}/${localVue.prototype.$route.params.uid}`);
    let request = mockPut.mock.calls[0][1];
    expect(request.documentation.sections[0].title).toBe('One ring to rule them all');
    expect(request.documentation.sections[0].text).toBe('One ring to find them.');

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
    expect(url).toBe(`${localVue.prototype.$compounds_url}/${localVue.prototype.$route.params.uid}`);
    request = mockPut.mock.calls[1][1];
    expect(request.documentation.sections[1].title).toBe('One ring to rule them all');
    expect(request.documentation.sections[1].text).toBe('One ring to find them.');


    // TODO: test that UI updates after axios request is sent
  });
});
