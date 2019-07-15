import BootstrapVue from 'bootstrap-vue'
import VueRouter from 'vue-router'
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import SearchBar from '@/components/SearchBar.vue';
import responses from './responses.js'
import axios from 'axios'
const util = require('util')
const flushPromises = require('flush-promises')

jest.mock('axios')

const localVue = createLocalVue();

localVue.use(BootstrapVue)
localVue.use(VueRouter)
const router = new VueRouter()

describe('SearchBar Component', () => {
    const wrapper = mount(SearchBar, {
        localVue,
        router,
    })

    it('renders a text input form', () => {
        expect(wrapper.find({ name: "BFormInput" }).exists()).toBe(true);
    })

    it('renders a search button', () => {
        expect(wrapper.find('.search-button').exists()).toBe(true)
    })

    it('doesn\'t render autocomplete with no input', () => {
        expect(wrapper.find('.autocomplete-results').isVisible()).toBe(false);
    })

    it('given an input with autocomplete response calls axios once and passes correct URL endpoint and input data to axios', (done) => {
        axios.post.mockReturnValue(Promise.resolve(responses.s))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 's'
        searchInputTextField.trigger('input')
        wrapper.vm.$nextTick(() => {
            expect(axios.post).toHaveBeenCalledTimes(1)
            expect(axios.post.mock.calls[0][0]).toBe('/research_experiments/_search')
            expect(axios.post.mock.calls[0][1].suggest.text).toBe('s')
            done()
        })
    })

    it('given an input with no autosuggestions in the response calls axios again and passes URL endpoint and input data with fuzzy search', (done) => {
        axios.post.mockReset()
        axios.post.mockReturnValue(Promise.resolve(responses.fdNoSuggestions))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 'fd'
        searchInputTextField.trigger('input')
        wrapper.vm.$nextTick(() => {
            expect(axios.post).toHaveBeenCalledTimes(2)
            expect(axios.post.mock.calls[1][0]).toBe('/research_experiments/_search')
            expect(axios.post.mock.calls[1][1].suggest.text).toBe('fd')
            Object.keys(axios.post.mock.calls[1][1].suggest).forEach((key, index) => {
                if (!axios.post.mock.calls[1][1].suggest[key].hasOwnProperty['completion']) return;
                expect(axios.post.mock.calls[1][1].suggest[key].completion).toEqual(expect.objectContaining({ fuzzy: {} }));
            });
            done()
        })
    })

    it('given 9 autosuggestions in the response, renders an autocomplete menu with all suggestions', (done) => {
        axios.post.mockReturnValue(Promise.resolve(responses.s))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 's'
        searchInputTextField.trigger('input')
        wrapper.vm.$nextTick(() => {
            expect(wrapper.find('.autocomplete-results').isVisible()).toBe(true);

            const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *')
            expect(displayedSuggestions.length).toBe(9)
            expect(displayedSuggestions.is('li')).toBe(true)
            expect(displayedSuggestions.is('.autocomplete-result')).toBe(true)

            const expectedSuggestionsText = [
                'steven carroll',
                'scale viral e-services tests',
                'strategize global action-items tests',
                'strategize viral e-tailers tests',
                'sanchez',
                'smith',
                's45',
                'sl',
                'santa cruz'
            ]
            const displayedSuggestionsText = displayedSuggestions.wrappers.map((elem) => elem.text())
            expect(JSON.stringify(displayedSuggestionsText)).toEqual(JSON.stringify(expectedSuggestionsText))
            done()
        })
    })

    it('given 13 autosuggestions in the response, renders an autocomplete menu with 10 suggestions', async (done) => {
        axios.post.mockReturnValue(Promise.resolve(responses.moreThanTen))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 'm'
        searchInputTextField.trigger('input')
        
        await flushPromises()
        
        expect(wrapper.find('.autocomplete-results').isVisible()).toBe(true);
        const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *')
        expect(displayedSuggestions.is('li')).toBe(true)
        expect(displayedSuggestions.is('.autocomplete-result')).toBe(true)
        expect(displayedSuggestions.length).toBe(10)

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
        'mit'
      ]
        const displayedSuggestionsText = displayedSuggestions.wrappers.map((elem) => elem.text())
        expect(JSON.stringify(displayedSuggestionsText)).toEqual(JSON.stringify(expectedSuggestionsText))
        done()
    });

    it('no results are activated by default', async (done) => {
        axios.post.mockReturnValue(Promise.resolve(responses.s))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 's'
        searchInputTextField.trigger('input')
        await flushPromises()
        const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *')
        expect(displayedSuggestions.length).toBe(9)
        expect(displayedSuggestions.filter(w => w.classes('is-active')).length).toBe(0)
        done()
    });

    it('activates the first result on the press of the down arrow', async (done) => {
        axios.post.mockReturnValue(Promise.resolve(responses.s))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 's'
        searchInputTextField.trigger('input')

        await flushPromises()
        searchInputTextField.trigger('keydown.down')
        const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *')
        expect(displayedSuggestions.length).toBe(9)
        expect(displayedSuggestions.filter(w => w.is('.is-active')).length).toBe(1)
        expect(displayedSuggestions.wrappers[0].is('.is-active')).toBe(true)
        done()
    });

    it('activates the last result on the press of the up arrow', async (done) => {
        axios.post.mockReturnValue(Promise.resolve(responses.s))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 's'
        searchInputTextField.trigger('input')

        await flushPromises()

        searchInputTextField.trigger('keydown.up')
        const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *')
        expect(displayedSuggestions.length).toBe(9)
        expect(displayedSuggestions.filter(w => w.is('.is-active')).length).toBe(1)
        expect(displayedSuggestions.wrappers[8].is('.is-active')).toBe(true)
        done()
    });

    it('activated item disappears then loops to the top on two down arrow presses at the bottom of the suggestion menu', async (done) => {
        axios.post.mockReturnValue(Promise.resolve(responses.s))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 's'
        searchInputTextField.trigger('input')

        await flushPromises()
        // activates the bottom menu item
        searchInputTextField.trigger('keydown.up')
        searchInputTextField.trigger('keydown.down')
        
        const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *')
        expect(displayedSuggestions.length).toBe(9)
        expect(displayedSuggestions.filter(w => w.classes('is-active')).length).toBe(0)
        
        searchInputTextField.trigger('keydown.down')
        expect(displayedSuggestions.length).toBe(9)
        expect(displayedSuggestions.filter(w => w.is('.is-active')).length).toBe(1)
        expect(displayedSuggestions.wrappers[0].is('.is-active')).toBe(true)
        done();
    })

    it('activated item disappears then loops to the bottom on two up arrow presses from the top of the suggestion menu', async(done) => {
        axios.post.mockReturnValue(Promise.resolve(responses.s))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 's'
        searchInputTextField.trigger('input')

        await flushPromises()
        // activates the top menu item
        searchInputTextField.trigger('keydown.down')
        searchInputTextField.trigger('keydown.up')
        
        const displayedSuggestions = wrapper.find('.autocomplete-results').findAll('ul > *')
        expect(displayedSuggestions.length).toBe(9)
        expect(displayedSuggestions.filter(w => w.classes('is-active')).length).toBe(0)
        
        searchInputTextField.trigger('keydown.up')
        expect(displayedSuggestions.length).toBe(9)
        expect(displayedSuggestions.filter(w => w.is('.is-active')).length).toBe(1)
        expect(displayedSuggestions.wrappers[8].is('.is-active')).toBe(true)
        done();
    })

    it('vanishes the suggestion menu on press of esc key', async () => {axios.post.mockReturnValue(Promise.resolve(responses.s))
        axios.post.mockReturnValue(Promise.resolve(responses.s))
        const searchInputTextField = wrapper.find({ name: "BFormInput" })
        searchInputTextField.element.value = 's'
        searchInputTextField.trigger('input')

        await flushPromises()

        searchInputTextField.trigger('keydown.esc')
        expect(wrapper.find('.autocomplete-results').isVisible()).toBe(false);
    })
    // TODO: Write unit tests for testing fuzzy search rendering


})