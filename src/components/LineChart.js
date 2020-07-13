import { Scatter } from 'vue-chartjs';

export default {
  extends: Scatter,
  props: {
    chartdata: {
      type: Array,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
  },
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
