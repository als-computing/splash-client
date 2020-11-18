<template>
  <div class="lists">
    <b-container>

      <!-- <b-row v-if=catalogNotFound>
        <b-col>
          <div  class="mx-auto .align-middle">
            <h1 class="display-4"> "{{$route.params.catalog}}" catalog not found </h1>
            <b-button variant="outline-primary" class ="mb-1" :to="'/runs'">Back to catalogs</b-button>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col v-if=showRuns sm>
           <h5 class="display-6">Run ID's of {{$route.params.catalog}}: </h5>
           <b-button variant="outline-primary" class ="mb-1" :to="'/runs'">Back to catalogs</b-button>
          <b-list-group class="runs-display">
            <b-list-group-item
            v-for="run in runs"
            :key="run.uid"
            :to="run.uid"
            v-on:click="runSelected = true; currentRun = run"
            :replace="!!$route.params.uid" :append="!$route.params.uid"
            :active='$route.params.uid === run.uid'> Sample: {{run.sample_name}} <br><br> # of images:{{run.num_images}}</b-list-group-item>
          </b-list-group>
        </b-col>
        <b-col sm><run-visualizer :num-frames="currentRun.num_images" v-if="runSelected" class ="image-display mb-1"/></b-col>
      </b-row> -->
    <b-table striped hover :items="runs" :fields="fields" responsive @row-clicked="rowClickHandler">
      <template v-slot:cell(image)="row">
        <!-- <b-img src="https://picsum.photos/1024/400/?image=41" fluid  rounded blank-color="#777" img-lazy thumbnail alt="Responsive image"></b-img> -->
        <b-img-lazy v-if="loaded" :src="thumbnails[row.index]" fluid rounded blank-color="#777" thumbnail alt="Responsive image"></b-img-lazy> 
      </template>
    </b-table>
    </b-container>
  </div>
</template>

<script>
import RunVisualizer from '@/components/RunVisualizer.vue';

export default {
  data: () => ({
    catalogNotFound: false,
    fields: ['collection_date', 'experiment_name' , 'sample_name', 'experimenter_name', 'uid', 'image'],
    runs: [],
    currentRun: {},
    runSelected: false,
    thumbnails: [],
    loaded: false
  }),
  components: {
    'run-visualizer': RunVisualizer,
  },

  async mounted() {
    await this.listRuns();

    console.log(this.runs)
    //load images array
    for (let run in this.runs){
      const jpeg = await this.getJpeg(this.$route.params.catalog, this.runs[run].uid);
      this.thumbnails.push(jpeg)
    }
    this.loaded = true;
    this.currentUid = this.$route.params.uid;
  },
  methods: {

    async listRuns() {
      try {
        const requestUrl = this.$runs_url.concat('/', this.$route.params.catalog);
        const response = await this.$api.get(requestUrl);
        this.runs = response.data;
        // for (const run of this.runs){
        //   run.image_url = requestUrl + "/" + run.uid + "/thumb";
        //   // run.image_url = "http://localhost:8080/api/v1/runs/tomo_demo/5c221408-e89e-40d3-a493-344cee481b84/thumb";
        // }
        
        // callback(this.runs);
        // return this.runs;
      
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
    },

    

    async getJpeg(catalog_name, uid) {
      try {
        console.log("&&&&&&&&")
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
</style>
