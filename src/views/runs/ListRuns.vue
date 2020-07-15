<template>
  <div class="lists">
    <b-container>
      <b-row v-if=catalogNotFound> 
        <b-col>
          <div  class="mx-auto .align-middle">
            <h1 class="display-4"> "{{$route.params.catalog}}" catalog not found </h1>
            <b-button variant="outline-primary" class ="mb-1" :to="'/runs'">Back to catalogs</b-button>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col v-if=showUids md="4">
           <h5 class="display-6">Run ID's of {{$route.params.catalog}}: </h5>
           <b-button variant="outline-primary" class ="mb-1" :to="'/runs'">Back to catalogs</b-button>
          <b-list-group>
            <b-list-group-item
            v-for="uid in uids"
            :key="uid"
            :to="uid"
            v-on:click="uidSelected = true; currentUid= uid"
            :replace="!!$route.params.uid" :append="!$route.params.uid"
            :active='$route.params.uid === uid'>{{uid}}</b-list-group-item>
          </b-list-group>
        </b-col>
        <b-col><run-visualizer :key="currentUid" v-if="uidSelected"/></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import RunVisualizer from '@/components/RunVisualizer.vue';

export default {
  data: () => ({
    catalogNotFound: false,
    showUids: false,
    uids: [],
    currentUid: '',
    uidSelected: false,
  }),
  components: {
    'run-visualizer': RunVisualizer,
  },

  async mounted() {
    const requestUrl = this.$runs_url.concat('/', this.$route.params.catalog);
    await this.listUids(requestUrl);
    if (this.$route.params.uid) {
      this.uidSelected = true;
    }
  },
  methods: {
    async listUids(requestUrl) {
      try {
        const response = await this.$api.get(requestUrl);
        console.log(response.data.runs);
        this.uids = response.data.runs;
        this.showUids = true;
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
  },

};
</script>
