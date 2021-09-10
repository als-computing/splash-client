import Vue from 'vue';

export default {
  _endpoint: ''
  createRef() {
    Vue.prototype.$api.put();
    console.log(this._endpoint)
  },
};
