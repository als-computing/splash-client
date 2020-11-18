<template>
  <div class="lists">
    <b-container>
      <b-row>
        <h3 class="display-6" v-if="somethingWentWrong">Something went wrong. Try reloading the page. If the problem persists contact an administrator</h3>
        <b-col v-if=showCatalogs>
          <h1 class="display-4">Catalogs: </h1>
          <p v-if="noCatalogs"> 0 catalogs found </p>
          <b-list-group>
            <b-list-group-item v-for="catalog in catalogs" :key="catalog" :to="{ path: catalog}" append>{{catalog}}</b-list-group-item>
          </b-list-group>
            <b-table striped hover :items="listRuns" :fields="fields" responsive @row-clicked="rowClickHandler">
            <template v-slot:cell(image)="row">
              <b-img src="https://picsum.photos/1024/400/?image=41" fluid  rounded blank-color="#777" img-lazy thumbnail alt="Image unavailabe"></b-img>
              <!-- <b-img :src="getJpeg(row.item.image_url)" fluid  rounded blank-color="#777" img-lazy thumbnail alt="Responsive image"></b-img> -->
            </template>
          </b-table>
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
