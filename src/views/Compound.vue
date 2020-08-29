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
                :key="index + section.title + section.text"
              >
                <b-button
                  @click="addSection(index)"
                  :disabled="currently_edited_index !== undefined"
                  v-show="currently_edited_index !== index && index === 0"
                >Add section</b-button>
                <div @dblclick="edit(index, section.text, section.title)">
                  <div v-show="index !== currently_edited_index">
                    <p>
                      <strong>{{section.title}}</strong>
                      <span class="pointer" @click="edit(index, section.text, section.title)">
                        <u>[edit]</u>
                      </span>
                      <span class="text-muted" style="font-size:0.8rem">(or double click)</span>
                    </p>
                    <div class="markdown-html" v-html="parseMarkdown(section.text)" />
                  </div>
                  <div v-if="index === currently_edited_index">
                    <b-form-input v-model="edited_data.title" :readonly="saving" />
                    <b-form-textarea v-model="edited_data.text" max-rows="100" :readonly="saving" />
                    <b-button-toolbar>
                      <b-button
                        variant="primary"
                        @click="saveEdit(index, section)"
                        :disabled=" (edited_data.title === '' || edited_data.text === '') || (((edited_data.title === section.title) && (edited_data.text === section.text)) || saving)"
                      >Save</b-button>
                      <b-button
                        variant="danger"
                        @click="removeFocus(); deleteIfNew(index, section)"
                        :disabled="saving === true"
                      >Cancel</b-button>
                      <b-button
                        variant="warning"
                        @click="showDeleteConfirmation(index)"
                        v-show="!(section.title === '' || section.text === '') && !saving"
                      >Delete Section</b-button>
                      <b-spinner v-show="(saving === true)" />
                    </b-button-toolbar>
                  </div>
                </div>
                <b-button
                  :disabled="currently_edited_index !== undefined"
                  v-show="currently_edited_index !== index"
                  @click="addSection(index+1)"
                >Add section</b-button>
                <b-modal
                  v-model="couldNotSave"
                  v-b-modal.modal-center
                  ok-only
                  :static="true"
                >We couldn't save. Check your internet connection and try again. If the problem persists, contact the administrator.</b-modal>
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
import utils from '@/views/utils';

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
    async removeFocus() {
      this.currently_edited_index = undefined;
      this.edited_data.text = '';
      this.edited_data.title = '';
    },
    async saveEdit(indexChanged, originalSection) {
      try {
        this.saving = true;
        this.compound.documentation.sections[indexChanged] = { title: this.edited_data.title, text: this.edited_data.text };
        await this.updateDatabase();
        // TODO Change this so that you can edit the title
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
    async updateDatabase() {
      const { uid } = this.compound; delete this.compound.uid;
      await this.$api.put(`${this.$compounds_url}/${this.$route.params.uid}`, this.compound);
      this.compound.uid = uid;
    },
    addSection(index) {
      if (!Number.isInteger(index)) {
        throw Error('Index should be integer');
      }
      const blankSection = {
        title: '',
        text: '',
      };
      this.compound.documentation.sections.splice(index, 0, blankSection);
      this.edit(index, blankSection.title, blankSection.text);
    },
    async deleteSection(index) {
      if (!Number.isInteger(index)) {
        throw Error('Index should be integer');
      }

      this.saving = true;
      const section = this.compound.documentation.sections[index];
      try {
        // delete from array without leaving a hole
        this.compound.documentation.sections.splice(index, 1);
        await this.updateDatabase();
        this.removeFocus();
        this.saving = false;
      } catch (error) {
        this.compound.documentation.sections.splice(index, 0, section);
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
    showDeleteConfirmation(index) {
      this.$bvModal.msgBoxConfirm('Are you sure you want to delete this section? This can\'t be undone.', {
        title: 'Please Confirm',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      })
        .then((value) => {
          if (value) {
            this.deleteSection(index);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    deleteIfNew(index, section) {
      if (section.title === '' && section.text === '') {
        // delete from array without leaving a hole
        this.compound.documentation.sections.splice(index, 1);
      }
    },
    parseMarkdown(text) {
      return utils.parseMarkDown(text);
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
