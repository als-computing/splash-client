<template>
  <div class="compound">
    <h1>{{compound.name}}</h1>
    <b-jumbotron>
        <b-card-group deck>
            <ReadField name="name" v-bind:value="compound.name" />
            <ReadField name="document" v-bind:value="compound.document" />
            <ReadField name="water relevance" v-bind:value="compound.produced_water_relevance" />
            <ReadField name="mwet relevance" v-bind:value="compound.mwet_relevance" />
            <ReadField name="challenges" v-bind:value="compound.challenges" />
            <ReadField name="aqueous properties" v-bind:value="compound.aqueous_props" />
            <ReadField name="adsorption properties" v-bind:value="compound.adsorption_props" />
            <ReadField name="analytical techniques" v-bind:value="compound.analytical_techniques" />
            <ReadField name="spectroscopictechniques" v-bind:value="compound.spectroscopic_techniques" />

        </b-card-group>
    </b-jumbotron>
    <b-jumbotron>
        <h2>Experiments</h2>

        <b-container class="bv-example-row">
        <b-row>
            <b-table striped hover :items="compound.experiments" :fields="experiment_fields" responsive="true" @row-clicked="rowClickHandler"/>
            <b-col><experiment-line-chart :experiment="open_experiment"/></b-col>

        </b-row>
        </b-container>


    </b-jumbotron>
  <b-jumbotron>
      {{compound.documentation}}
  </b-jumbotron>
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
    };
  },
  created() {
    this.$api.get(`${this.$compounds_url}/${this.$route.params.name}`)
      .then((response) => {
        this.compound = response.data;
        this.open_experiment = response.data.experiments[0];
      })
      .catch((e) => {
        // this.errors.put(e)
      });
  },
  methods: {
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
