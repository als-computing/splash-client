<template>
  <div class="run-data">


    <div class="container">
        <line-chart  v-if="loaded"
            :chartdata="chartdata"
            :options="options"/>
    </div>
  </div>
</template>

<script>
import ReadField from '@/components/ReadField.vue';
import LineChart from '@/components/LineChart';

export default {
  props: {
    experiment: {
      type: Object,
    },
  },
  data: () => ({

    loaded: false,
    metadata: {},
    chartdata: [],
    options: {
      elements: {
        line: {
          tension: 0.000001,
        },
      },
      showLines: true,
      scales: {
        yAxes: [{
          stacked: true,
        }],
      },
      legend: {
        position: 'bottom',
      },
    },
  }),
  watch: {
    async experiment(new_experiment) {
      try {
        this.loaded = false;
        const response = await this.$api.get(`${this.$runs_url}/${new_experiment.run}`);
        const chartdata = {};
        this.metadata = response.data.metadata;
        this.label = 'time';
        this.chartdata.datasets = [{
          fill: false, label: this.metadata.start.sample_name, borderColor: 'rgba(0, 0, 0, 1)', data: response.data.data,
        }];
        this.loaded = true;
      } catch (e) {
        console.log(e);
      }
    },
  },
  // mounted(){
  //     console.log(this.experiment)
  //     try{
  //         this.loaded = false
  //         const response = await this.$api.get(this.$runs_url + "/" + this.experiment.run)
  //         const chartdata = {}
  //         this.metadata = response.data.metadata
  //         this.label = 'time'
  //         this.chartdata.datasets = [{fill: false, label: this.metadata.start.sample_name, borderColor: 'rgba(0, 0, 0, 1)', data: response.data.data}]
  //         this.loaded = true


  //     }
  //     catch (e){
  //         console.error(e)
  //     }

  // },

  components: {
    LineChart,
  },

};
</script>
