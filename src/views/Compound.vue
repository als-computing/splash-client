<template>
  <div class="compound">
    <h1>{{compound.species}}</h1>
    <b-jumbotron>
        <b-card-group deck>
            <ReadField name="Produced Water Relevance" v-bind:value="compound.produced_water_relevance" />
            <ReadField name="Origin" v-bind:value="compound.origin" />
            <ReadField name="Fundamental Relevance" v-bind:value="compound.fundamental_relevance" />
            <ReadField name="Molecular Weight" v-bind:value="compound.molecular_weight" />
            <ReadField name="Aqueous Species" v-bind:value="compound.aqueous_species" />
            <ReadField name="pKa" v-bind:value="compound.pka" />
            <ReadField name="Adsorption Properties" v-bind:value="compound.adsorption" />
            <ReadField name="Analytical Techniques" v-bind:value="compound.analytical" />
            <ReadField name="Spectroscopic Techniques" v-bind:value="compound.spectroscopic" />
            <ReadField name="Chemical Reference" v-bind:value="compound.chem_reference" />
            <ReadField name="MSDS" v-bind:value="compound.msds" />
            <ReadField name="Purchase Options" v-bind:value="compound.purchase_options" />
            <ReadField name="Contributors" v-bind:value="compound.contributors" />

        </b-card-group>
    </b-jumbotron>
    <!-- <b-jumbotron>
        <h2>Experiments</h2>

        <b-container class="bv-example-row">
        <b-row>
            <b-table striped hover :items="compound.experiments" :fields="experiment_fields" responsive="true" @row-clicked="rowClickHandler"/>
            <b-col><experiment-line-chart :experiment="open_experiment"/></b-col>

        </b-row>
        </b-container>


    </b-jumbotron> -->
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
    this.$api.get(`${this.$compounds_url}/${this.$route.params.uid}`)
      .then((response) => {
        this.compound = response.data;
        // this.open_experiment = response.data.experiments[0];
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
