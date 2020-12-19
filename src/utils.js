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
};
