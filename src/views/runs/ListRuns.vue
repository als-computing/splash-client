<template>
  <div class="lists">
    <b-navbar>
      <SearchBar/>
    </b-navbar>
    <b-container>
    <b-table striped hover :items="runs" :fields="fields" responsive @row-clicked="rowClickHandler">

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
    fields: ['collection_date', 'experiment_name' , 'sample_name', 'experimenter_name', 'uid', 'image'],
    runs: [],
    currentRun: {},
    runSelected: false,
    thumbnails: {},
    runsLoading: false
  }),
  components: {
    'run-visualizer': RunVisualizer,
  },

  async mounted() {
    this.scroll();
    while(true){
      if (this.$el.getBoundingClientRect().bottom > window.innerHeight){
        break;
      }
      await this.addRuns();
      
    }
    
    this.addThumbs();
    console.log(this.runs)
    this.currentUid = this.$route.params.uid;
    
  },

  methods: {
    async addThumbs(){
       for (let index in this.runs){
        const run = this.runs[index];
        if (this.thumbnails[run.uid] === undefined){
              const jpeg = await this.getJpeg(this.$route.params.catalog, run.uid);
              // this.thumbnails[run.uid] = jpeg;
              this.$set(this.thumbnails, run.uid, jpeg);
              console.log("pushed jpeg to " + run.uid);
        }
       }
    },

    async scroll(){
      window.onscroll = async () => {
        let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
          if (bottomOfWindow) {
            const beforeRunsNum = this.runs.length;
            await this.addRuns();
            const afterRunsNum= this.runs.length;
            const newRunsNum = afterRunsNum - beforeRunsNum;
            if (newRunsNum < 1){
              return;
            }
            this.addThumbs();
          }
      };
    },

    async addRuns() {
      try {
        this.runsLoading = true
        const requestUrl = this.$runs_url.concat('/', this.$route.params.catalog + "?skip=" + this.runs.length + "&limit=" + PAGE_SIZE);
        const response = await this.$api.get(requestUrl);
        this.runs.push(...response.data);
      
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          if (error.response.status === 404) {
            this.catalogNotFound = true;
          }
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
      this.runsLoading = false;
    },

    

    async getJpeg(catalog_name, uid) {
      try {
        let url = this.$runs_url + "/" + catalog_name + "/" +uid + "/thumb";
        const response = await this.$api
          .get(url, {
            responseType: 'arraybuffer',
          });
        return "data:image/jpg;base64," + Buffer.from(response.data, 'binary').toString('base64');

      } catch (e) {
        console.log(e)
        return "";
      }
    },

    async rowClickHandler(run){
       this.$router.push({ path: `/run/${this.$route.params.catalog}/${run.uid}` });
    }
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
