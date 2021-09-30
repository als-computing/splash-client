<template>
  <div class="lists">
     <b-container fluid>
      <b-row>
        <b-col md="3">
          <b-card class="m-3">
            <b-form @submit="onSubmit" @reset="onReset"  fixed="top">
              <small>Search</small>
                <b-row class="pt-2 pb-2">
                  <b-col sm="2">
                    <label class="font-weight-bold text-muted" for="input-small">Text</label>
                  </b-col>
                  <b-col sm="10">
                    <b-form-input id="input-uid" v-model="searchStart" ref="uid" size="sm" placeholder="Enter Search Text"></b-form-input>
                  </b-col>
                </b-row>
                <b-row class="pt-2 pb-2">
                  <b-col sm="2">
                    <label class="font-weight-bold text-muted" for="input-small">From</label>
                  </b-col>
                  <b-col sm="10">
                    <div >
                      <b-form-input type="date" id="input-uid" v-model="searchFrom" ref="from" size="sm" placeholder="From"></b-form-input>
                      <b-form-timepicker class="d-inline" v-model="searchFromTime" locale="en" size="sm"></b-form-timepicker>
                    </div>
                  </b-col>
                </b-row>
                <b-row class="pt-2 pb-2">
                  <b-col sm="2">
                    <label class="font-weight-bold text-muted" for="input-small">To</label>
                  </b-col>
                  <b-col sm="10">
                    <b-form-input type="date" id="input-uid" v-model="searchTo" ref="to" size="sm" placeholder="To"></b-form-input>
                    <b-form-timepicker v-model="searchToTime" locale="en" size="sm"></b-form-timepicker>
                  </b-col>
                </b-row>
                <b-button type="submit" variant="primary">Submit</b-button>
                <b-button type="reset" variant="primarformToy ">Reset</b-button>
            </b-form>
          </b-card>
      </b-col>
      <b-col md="9">

            <b-table class="table-sm" ref="runsTable" striped hover :items="runs" :fields="fields" responsive @row-clicked="rowClickHandler">

              <template #cell(collection_date)="data">
                <div class="sm">

                    <small>{{ new Date(data.value * 1000).toLocaleString() }}</small>
                </div>
              </template>

              <template #cell()="data">
                <div class="sm">
                    <small>{{ data.value }}</small>
                </div>
              </template>

              <template v-slot:cell(image)="row">
                  <b-img v-if="thumbnails[row.item.uid]" :src="thumbnails[row.item.uid]" class="thumbnail-image" fluid rounded thumbnail blank-color="white" alt="Image Not Available"></b-img>
                  <b-spinner v-if="!thumbnails[row.item.uid]" variant="light"/>
              </template>

            </b-table>
            <div class="d-flex justify-content-center mb-3">
              <b-spinner v-if="runsLoading" label="Loading..."></b-spinner>
            </div>

      </b-col>
      </b-row>
    </b-container>

  </div>
</template>

<script>
import RunVisualizer from '@/components/RunVisualizer.vue';
import SearchBar from '@/components/SearchBar.vue';

const PAGE_SIZE = 5;

export default {
  data: () => ({
    catalogNotFound: false,
    fields: ['collection_date', 'experiment_name', 'sample_name', 'experimenter_name', 'uid', 'image'],
    runs: [],
    currentRun: {},
    runSelected: false,
    thumbnails: {},
    runsLoading: false, // helps control spinner
    stopRunsLoading: false, // signal to stop loading runs
    stopThumbsLoading: false, // signal to stop loading thumbs
    searchStart: '',
    searchFrom: '',
    searchFromTime: '',
    searchTo: '',
    searchToTime: '',
  }),
  components: {
    'run-visualizer': RunVisualizer,
  },

  async mounted() {
    this.scroll();
    await this.fillWindowWithRuns();
    this.addThumbs();
    this.currentUid = this.$route.params.uid;
  },

  async beforeDestroy() {
    console.log('closing');
    this.stopThumbsLoading = true;
  },

  methods: {
    async addThumbs() {
      for (const index in this.runs) {
        if (this.stopThumbsLoading) break;
        const run = this.runs[index];
        if (this.thumbnails[run.uid] === undefined) {
          this.$set(this.thumbnails, run.uid, null);
          const jpeg = this.getThumb(this.$route.params.catalog, run.uid);
        }
      }
      this.stopThumbsLoading = false;
    },

    async scroll() {
      window.onscroll = async () => {
        const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
        if (bottomOfWindow) {
          const beforeRunsNum = this.runs.length;
          await this.addRuns();
          const afterRunsNum = this.runs.length;
          const newRunsNum = afterRunsNum - beforeRunsNum;
          if (newRunsNum < 1) {
            return;
          }
          this.addThumbs();
        }
      };
    },

    async fillWindowWithRuns() {
      while (true) {
        if (this.stopRunsLoading) break;
        if (this.$el.getBoundingClientRect().bottom > 1.5 * window.innerHeight) {
          this.runsLoading = false;
          break;
        }
        const numToAdd = await this.addRuns();
        if (numToAdd == 0) {
          this.runsLoading = false;
          break;
        }
      }
    },

    async addRuns() {
      try {
        this.runsLoading = true;
        const requestUrl = this.$runs_url.concat('/', this.$route.params.catalog, '?skip=', this.runs.length, '&limit=', PAGE_SIZE, this.buildQuery());
        const response = await this.$api.get(requestUrl);
        this.runs.push(...response.data);
        return response.data.length;
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            this.catalogNotFound = true;
          }
        }
      }
      this.runsLoading = false;
      return false;
    },

    async getThumb(catalog_name, uid) {
      try {
        const url = `${this.$runs_url}/${catalog_name}/${uid}/thumb`;
        const response = await this.$api
          .get(url, {
            responseType: 'arraybuffer',
          });
        this.$set(this.thumbnails, uid, `data:image/jpg;base64,${Buffer.from(response.data, 'binary').toString('base64')}`);
      } catch (e) {
        return '';
      }
    },

    async rowClickHandler(run) {
      this.$router.push({ path: `/run/${this.$route.params.catalog}/${run.uid}` });
    },

    async onSubmit(event) {
      event.preventDefault();
      this.stopThumbsLoading = true;
      this.stopRunsLoading = true;
      this.runs = [];
      this.thumbnails = {};
      // this.$set(this.runs, []);
      // this.$set(this.thumbnails, {});
      this.stopRunsLoading = false;
      this.$nextTick(this.fillWindowWithRuns);
    },
    onReset(event) {
      event.preventDefault();
      this.runs = [];
    },
    buildQuery() {
      let query = '';
      if (this.searchStart) {
        query += `&text_query=${this.searchStart}`;
      }
      if (this.searchFrom) {
        const fromDT = `${this.searchFrom} ${this.searchFromTime}`;
        query += `&fromDT=${new Date(fromDT).valueOf() / 1000}`;
      }
      if (this.searchTo) {
        const toDT = `${this.searchTo} ${this.searchToTime}`;
        query += `&toDT=${new Date(toDT).valueOf() / 1000}`;
      }
      return query;
    },
  },

};
</script>
<style scoped>
.runs-display {
   height: 70vh;
   overflow: auto;
}
.thumbnail-image{
  max-height: 5em;
}
</style>
