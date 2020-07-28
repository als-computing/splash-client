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
};
