import BootstrapVue from 'bootstrap-vue';
import { mount, /* shallowMount, */ createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios'; // This comes from the __mocks__ folder
import Compound from '@/views/Compound.vue';
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
    const sectionTitles = wrapper.findAll('strong');
    expect(title.text()).toBe(boron.species);
    const markdowns = wrapper.findAll('.markdown-html');
    boron.documentation.sections.forEach((elem, i) => {
      expect(sectionTitles.at(i).text()).toBe(elem.title);
      // We're stripping all whitespace from both strings because the whitespace is being inconsistent
      // Ideally we wouldn't have to do this.
      expect(markdowns.at(i).html().replace(/\s/g, '')).toBe(`<div class="markdown-html">${parseMarkDown(elem.text)}</div>`.replace(/\s/g, ''));
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
    expect(url).toBe(`${localVue.prototype.$compounds_url}/${localVue.prototype.$route.params.uid}`)
    const request = mockPut.mock.calls[0][1];
    expect(request.documentation.sections[0].title).toBe('One ring to rule them all');
    expect(request.documentation.sections[0].text).toBe('One ring to find them.');
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
    expect(mockPut).toBeCalledTimes(0);
  });
  // TODO: Implement delete section testing for axios
  // TODO: Implement add section testing for axios
  // TODO: Test the left sidebar
});
