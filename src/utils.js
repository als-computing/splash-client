import marked from 'marked';
import DOMPurify from 'dompurify';

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
      .replace(/(^\w|\b\w)/g, (m) => m.toUpperCase()) // title case words
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

  localDateFromUtc(utcDate) {
    const localDate = new Date(`${utcDate}Z`);
    return localDate;
  },

  // Taken from: https://stackoverflow.com/questions/18758772/how-do-i-validate-a-date-in-this-format-yyyy-mm-dd-using-jquery/35413963
  isValidDate(dateString) {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false; // Invalid format
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0, 10) === dateString; // In some cases Chrome will 'correct' for invalid dates such as
    // 2019-02-31 and turn it into 2019-03-03 (https://levelup.gitconnected.com/cross-browser-crazy-44e90d61b204).
    // This makes sure that the original string matches the Date object's string. If it's not matching then this indicates
    // that the date was corrected.
  },
  isOnlyDigits(value) {
    return /^[0-9]+$/.test(value);
  },
  isStrEmptyOrWhitespace(str) {
    if (/\S/.test(str)) return false;
    return true;
  },
  validPageRange(rangeStr) {
    // This regex for validating page ranges was taken from here: https://stackoverflow.com/a/4468356
    const regex = /^(\s*\d+\s*(-\s*\d+\s*)?)(,\s*\d+\s*(-\s*\d+\s*)?)*$/g;
    return regex.test(rangeStr);
  },
};

export function isDoiFormat(string) {
  let numForwSlashes = string.match(/\//g);
  if (numForwSlashes === null) {
    return false;
  }
  numForwSlashes = numForwSlashes.length;
  if (string.startsWith('10.') && (string.slice(-1) !== '/' || numForwSlashes >= 2)) {
    return true;
  }
  return false;
}
