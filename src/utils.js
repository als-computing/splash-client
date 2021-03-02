import marked from 'marked';
import DOMPurify from 'dompurify';
import Vue from 'vue';

export default {
  // https://stackoverflow.com/questions/32441347/how-do-i-use-vue-js-debounce-filter
  debounce(fn, delay) {
    let timeoutID = null;
    return function debounceReturn(...args) {
      clearTimeout(timeoutID);
      const that = this;
      timeoutID = setTimeout(() => {
        fn.apply(that, args);
      }, delay);
    };
  },

  parseMarkDown(markdown, renderer) {
    if (typeof renderer === 'object') {
      marked.use({ renderer });
    } else if (renderer !== undefined) {
      throw TypeError('2nd positional arg `renderer` must be undefined or an object');
    }
    const html = marked(markdown);
    return DOMPurify.sanitize(html);
  },

  sanitizeInput(text) {
    return DOMPurify.sanitize(text);
  },

  convertToTitleCase(str) {
    return str
      .replace(/([^A-Z])([A-Z])/g, '$1 $2') // split cameCase
      .replace(/[_\-]+/g, ' ') // split snake_case and lisp-case
      .toLowerCase()
      .replace(/(^\w|\b\w)/g, function (m) { return m.toUpperCase(); }) // title case words
      .replace(/\s+/g, ' ') // collapse repeated whitespace
      .replace(/^\s+|\s+$/, ''); // remove leading/trailing whitespace
  },

  sortNameValueArray(array) {
    array.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  },
};
