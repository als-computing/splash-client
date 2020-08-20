<template>
  <div class="compound">
    <h1>{{compound.species}}</h1>
    <b-jumbotron>
      <b-container fluid>
        <b-row>
          <b-col lg="3">
            <b-list-group>
              <b-list-group-item v-for="data in compound.metadata" :key="data.value + data.name">
                {{data.name}}: <h5>{{data.value}}</h5>
              </b-list-group-item>
            </b-list-group>
          </b-col>
          <b-col  lg="9">
            <b-card>
              <div align="left" v-for="(section, index) in compound.documentation.sections" :key="section.title + section.text">
                <p><strong>{{section.title}}</strong></p>
                <div v-html="parseMarkdown(section.text)" v-show="index !== currently_edited_index" @dblclick=""/>
                <b-form-textarea v-model="section.text" v-show="index === currently_edited_index" max-rows="100"/>
              </div>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </b-jumbotron>
    <!-- <b-jumbotron>
        <h2>Experiments</h2>

        <b-container class="bv-example-row">
        <b-row>
            <b-table striped hover :items="compound.experiments" :fields="experiment_fields" responsive="true" @row-clicked="rowClickHandler"/>
            <b-col><experiment-line-chart :experiment="open_experiment"/></b-col>

        </b-row>
        </b-container>


    </b-jumbotron>-->
  </div>
</template>

<script>

// import ExperimentLineChart from '@/components/ExperimentLineChart.vue';
import ReadField from '@/components/ReadField.vue';

export default {

  data() {
    return {
      experiment_fields: ['type', 'researcher', 'date'],
      compound: {},
      experiments: [],
      open_experiment: {},
      errors: [],
      currently_edited_index: undefined,
    };
  },
  async created() {
    try {
      const response = await this.$api.get(`${this.$compounds_url}/${this.$route.params.uid}`);
      this.compound = response.data;
    } catch (e) {
      console.log(e);
    }
    // this.open_experiment = response.data.experiments[0];
  },
  methods: {
    onDblClick() {
      currently_edited_index = index
    },
    parseMarkdown(text) {
      return this.$parseMarkDown(text);
    },
    rowClickHandler(experiment) {
      // this.$router.push({path: '/experiments/xas/' + experiment.run})
      this.open_experiment = experiment;
    },
  },
  components: {
    ReadField,
  },


};
</script>

<style scoped>
.wrap-anywhere {
  overflow-wrap: anywhere;
}


</style>
