<template>
  <div class="lists">
    <b-container>
      <b-row>
        <h3 class="display-6" v-if="somethingWentWrong">Something went wrong. Try reloading the page. If the problem persists contact an administrator</h3>
        <b-col v-if=showCatalogs>
          <h1 class="display-4">Catalogs: </h1>
          <p v-if="noCatalogs"> 0 catalogs found </p>
          <b-list-group>
            <b-list-group-item v-for="catalog in catalogs" :key="catalog.name" :to="{ path: catalog.name}" append>{{catalog.name}}</b-list-group-item>
          </b-list-group>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  data: () => ({
    somethingWentWrong: false,
    showCatalogs: false,
    noCatalogs: false,
    catalogs: [],
  }),

  async mounted() {
    this.listCatalogs(this.$runs_url);
  },
  methods: {
    async listCatalogs(requestUrl) {
      try {
        console.log(requestUrl);
        const response = await this.$api.get(requestUrl);
        this.catalogs = response.data;
        if (this.catalogs.length === 0) {
          this.noCatalogs = true;
        }
        this.showCatalogs = true;
      } catch (error) {
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
        this.somethingWentWrong = true;
      }
    },
  },

};
</script>
