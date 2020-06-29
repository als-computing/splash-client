import BootstrapVue from 'bootstrap-vue';
import VueRouter from 'vue-router';
import { mount, /* shallowMount, */ createLocalVue } from '@vue/test-utils';
import mockAxios from 'axios';
import SearchBar from '@/components/SearchBar.vue';
import responses from './search-responses';

// const util = require('util');
const flushPromises = require('flush-promises');

const localVue = createLocalVue();

localVue.use(BootstrapVue);
localVue.use(VueRouter);

localVue.use(
  {
    install(Vue) {
      const searchUrl = '/elasticsearch';
      Vue.prototype.$search = mockAxios.create({
        baseURL: searchUrl,
      });
      Vue.prototype.$elastic_index_url = 'experiments1/_search';
    },
  },
);
const router = new VueRouter();

describe('SearchBar component when isLoggedIn is true', () => {
  const wrapper = mount(SearchBar, {
    localVue,
    router,
    computed: {
      isLoggedIn() {
        return false;
      },
    },
  });

  it('does not render anything when isLoggedIn is false', () => {
    expect(wrapper.findComponent({ name: 'BFormInput' }).exists()).toBe(false);
    expect(wrapper.find('.search-button').exists()).toBe(false);
    expect(wrapper.find('.autocomplete-results').exists()).toBe(false);
  });
});

describe('SearchBar Component when isLoggedIn is true', () => {
  const wrapper = mount(SearchBar, {
    localVue,
    router,
    computed: {
      isLoggedIn() {
        return true;
      },
    },
  });

  it('renders a text input form', () => {
    expect(wrapper.findComponent({ name: 'BFormInput' }).exists()).toBe(true);
  });

  it('renders a search button', () => {
    expect(wrapper.find('.search-button').exists()).toBe(true);
  });

  it('doesn\'t render autocomplete with no input', () => {
    expect(wrapper.find('.autocomplete-results').element).not.toBeVisible();
  });

  it('given an input with autocomplete response calls axios once and passes correct URL endpoint and input data to axios', (done) => {
    mockAxios.post.mockReturnValue(Promise.resolve(responses.s));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 's';
    searchInputTextField.trigger('input');
    wrapper.vm.$nextTick(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockAxios.post.mock.calls[0][0]).toBe(localVue.prototype.$elastic_index_url);
      expect(mockAxios.post.mock.calls[0][1].suggest.text).toBe('s');
      done();
    });
  });

  it('given an input with no autosuggestions in the response calls axios again and passes URL endpoint and input data with fuzzy search', async () => {
    mockAxios.post.mockReset();
    mockAxios.post.mockReturnValue(Promise.resolve(responses.fdNoSuggestions));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 'fd';
    searchInputTextField.trigger('input');
    await wrapper.vm.$nextTick();
    expect(mockAxios.post).toHaveBeenCalledTimes(2);
    expect(mockAxios.post.mock.calls[1][0]).toBe(localVue.prototype.$elastic_index_url);
    expect(mockAxios.post.mock.calls[1][1].suggest.text).toBe('fd');
    Object.keys(mockAxios.post.mock.calls[1][1].suggest).forEach((key, index) => {
      if (!mockAxios.post.mock.calls[1][1].suggest[key].hasOwnProperty.completion) return;
      expect(mockAxios.post.mock.calls[1][1].suggest[key].completion)
        .toEqual(expect.objectContaining({ fuzzy: {} }));
    });
  });

  it('given 9 autosuggestions in the response, renders an autocomplete menu with all suggestions', async () => {
    mockAxios.post.mockReturnValue(Promise.resolve(responses.s));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 's';
    await searchInputTextField.trigger('input');
    expect(wrapper.find('.autocomplete-results').element).toBeVisible();

    const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *');
    expect(displayedSuggestions.length).toBe(9);
    expect(displayedSuggestions.contains('li')).toBe(true);
    expect(displayedSuggestions.contains('.autocomplete-result')).toBe(true);

    const expectedSuggestionsText = [
      'steven carroll',
      'scale viral e-services tests',
      'strategize global action-items tests',
      'strategize viral e-tailers tests',
      'sanchez',
      'smith',
      's45',
      'sl',
      'santa cruz',
    ];
    const displayedSuggestionsText = displayedSuggestions.wrappers.map((elem) => elem.text());
    expect(JSON.stringify(displayedSuggestionsText))
      .toEqual(JSON.stringify(expectedSuggestionsText));
  });

  it('given 13 autosuggestions in the response, renders an autocomplete menu with 10 suggestions', async (done) => {
    mockAxios.post.mockReturnValue(Promise.resolve(responses.moreThanTen));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 'm';
    searchInputTextField.trigger('input');

    await flushPromises();

    expect(wrapper.find('.autocomplete-results').element).toBeVisible();
    const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *');
    expect(displayedSuggestions.is('li')).toBe(true);
    expect(displayedSuggestions.is('.autocomplete-result')).toBe(true);
    expect(displayedSuggestions.length).toBe(10);

    const expectedSuggestionsText = [
      'mason evans',
      'michael peck',
      'mrs. ashley mcdowell',
      'mesh customized architectures tests',
      'mesh viral metrics tests',
      'maria',
      'm45',
      'me',
      'mg',
      'mit',
    ];
    const displayedSuggestionsText = displayedSuggestions.wrappers.map((elem) => elem.text());
    expect(JSON.stringify(displayedSuggestionsText))
      .toEqual(JSON.stringify(expectedSuggestionsText));
    done();
  });

  it('no results are activated by default', async () => {
    mockAxios.post.mockReturnValue(Promise.resolve(responses.s));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 's';
    await searchInputTextField.trigger('input');
    const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *');
    expect(displayedSuggestions.length).toBe(9);
    expect(displayedSuggestions.filter((w) => w.classes('is-active')).length).toBe(0);
  });

  it('activates the first result on the press of the down arrow', async (done) => {
    mockAxios.post.mockReturnValue(Promise.resolve(responses.s));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 's';
    await searchInputTextField.trigger('input');
    await searchInputTextField.trigger('keydown.down');
    const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *');
    expect(displayedSuggestions.length).toBe(9);
    expect(displayedSuggestions.filter((w) => w.classes('is-active')).length).toBe(1);
    expect(displayedSuggestions.wrappers[0].classes('is-active')).toBe(true);
    done();
  });

  it('activates the last result on the press of the up arrow', async (done) => {
    mockAxios.post.mockReturnValue(Promise.resolve(responses.s));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 's';
    await searchInputTextField.trigger('input');
    await searchInputTextField.trigger('keydown.up');
    const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *');
    expect(displayedSuggestions.length).toBe(9);
    expect(displayedSuggestions.filter((w) => w.classes('is-active')).length).toBe(1);
    expect(displayedSuggestions.wrappers[8].classes('is-active')).toBe(true);
    done();
  });

  it('activated item disappears then loops to the top on two down arrow presses at the bottom of the suggestion menu', async (done) => {
    mockAxios.post.mockReturnValue(Promise.resolve(responses.s));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 's';
    await searchInputTextField.trigger('input');

    // activates the bottom menu item
    await searchInputTextField.trigger('keydown.up');
    await searchInputTextField.trigger('keydown.down');

    const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *');
    expect(displayedSuggestions.length).toBe(9);
    expect(displayedSuggestions.filter((w) => w.classes('is-active')).length).toBe(0);

    await searchInputTextField.trigger('keydown.down');
    expect(displayedSuggestions.length).toBe(9);
    expect(displayedSuggestions.filter((w) => w.classes('is-active')).length).toBe(1);
    expect(displayedSuggestions.wrappers[0].classes('is-active')).toBe(true);
    done();
  });

  it('activated item disappears then loops to the bottom on two up arrow presses from the top of the suggestion menu', async (done) => {
    mockAxios.post.mockReturnValue(Promise.resolve(responses.s));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 's';
    await searchInputTextField.trigger('input');

    // activates the top menu item
    await searchInputTextField.trigger('keydown.down');
    await searchInputTextField.trigger('keydown.up');

    const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *');
    expect(displayedSuggestions.length).toBe(9);
    expect(displayedSuggestions.filter((w) => w.classes('is-active')).length).toBe(0);

    await searchInputTextField.trigger('keydown.up');
    expect(displayedSuggestions.length).toBe(9);
    expect(displayedSuggestions.filter((w) => w.classes('is-active')).length).toBe(1);
    expect(displayedSuggestions.wrappers[8].classes('is-active')).toBe(true);
    done();
  });

  it('vanishes the suggestion menu on press of esc key', async () => {
    mockAxios.post.mockReturnValue(Promise.resolve(responses.s));
    const searchInputTextField = wrapper.findComponent({ name: 'BFormInput' });
    searchInputTextField.element.value = 's';
    searchInputTextField.trigger('input');

    await flushPromises();

    searchInputTextField.trigger('keydown.esc');
    expect(wrapper.find('.autocomplete-results').element).toBeVisible();
  });
  // TODO: Write unit tests for testing fuzzy search rendering
});
