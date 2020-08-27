<template>
  <div class="compound" v-if="mounted">
    <h1>{{compound.species}}</h1>
    <b-jumbotron>
      <b-container fluid>
        <b-row>
          <b-col lg="3">
            <b-list-group>
              <b-list-group-item v-for="data in compound.metadata" :key="data.value + data.name">
                {{data.name}}:
                <h5>{{data.value}}</h5>
              </b-list-group-item>
            </b-list-group>
          </b-col>
          <b-col lg="9">
            <b-card>
              <div
                align="left"
                v-for="(section, index) in compound.documentation.sections"
                :key="section.title + section.text"
                @dblclick="edit(index, section.text, section.title)"
              >
                <div  v-show="index !== currently_edited_index">
                <p>
                  <strong>{{section.title}}</strong>
                  <span class="pointer" @click="edit(index, section.text, section.title)">
                    <u>[edit]</u>
                  </span>
                  <span class="text-muted" style="font-size:0.8rem">(or double click)</span>
                </p>
                <div
                  v-html="parseMarkdown(section.text)"
                />
                </div>
                <div v-show="index === currently_edited_index">
                  <b-form-input
                    v-model="edited_data.title"
                    :readonly="saving"
                  />
                  <b-form-textarea
                    v-model="edited_data.text"
                    max-rows="100"
                    :readonly="saving"
                  />
                  <b-button-toolbar>
                    <b-button
                      variant="primary"
                      @click="save(index, section)"
                      :disabled="((edited_data.title === section.title) && (edited_data.text === section.text)) || saving"
                    >Save</b-button>
                    <b-button
                      variant="danger"
                      @click="removeFocus()"
                      :disabled="saving === true"
                    >Cancel</b-button>
                    <b-spinner v-show="(saving === true)" />
                  </b-button-toolbar>
                </div>
                <hr v-show="index+1 !== compound.documentation.sections.length" />
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
      compound: {},
      currently_edited_index: undefined,
      edited_data: {
        title: '',
        text: '',
      },
      saving: false,
      couldNotSave: false,
      somethingWentWrong: true,
      mounted: false,
    };
  },
  async mounted() {
    try {
      const response = await this.$api.get(`${this.$compounds_url}/${this.$route.params.uid}`);
      this.compound = response.data;
      this.mounted = true;
      console.log('mounted');
    } catch (e) {
      this.somethingWentWrong = true;
      console.log(e);
    }
    // this.open_experiment = response.data.experiments[0];
  },
  methods: {
    removeFocus() {
      this.currently_edited_index = undefined;
      this.edited_data.text = '';
      this.edited_data.title = '';
    },
    async save(indexChanged, originalSection) {
      try {
        this.saving = true;
        // TODO Change this so that you can edit the title
        this.compound.documentation.sections[indexChanged].text = this.edited_data.text;
        this.compound.documentation.sections[indexChanged].title = this.edited_data.title;
        const { uid } = this.compound; delete this.compound.uid;
        await this.$api.put(`${this.$compounds_url}/${this.$route.params.uid}`, this.compound);
        this.compound.uid = uid;
        this.removeFocus();
        this.saving = false;
      } catch (error) {
        this.compound.documentation.sections[indexChanged] = originalSection;
        this.saving = false;
        this.couldNotSave = true;
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error);
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(error);
          console.log('Error', error.message);
        }
      }
    },
    edit(index, text, title) {
      if (this.saving) {
        return;
      }
      if (index !== this.currently_edited_index) {
        this.currently_edited_index = index;
        this.edited_data.text = text;
        this.edited_data.title = title;
      }
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
.pointer {
  cursor: pointer;
}
</style>
