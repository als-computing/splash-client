<template>
  <div class="lists">
    <b-container>
      <b-row>
        <b-col>
          <h1 class="display-4 mt-3">Catalogs: </h1>
          <error-card class="mt-5" v-if="somethingWentWrong"/>
          <p v-if="noCatalogs"> 0 catalogs found </p>
          <div v-if=showCatalogs>
          <b-list-group>
            <b-list-group-item v-for="catalog in catalogs" :key="catalog" :to="{ path: catalog}" append>{{catalog}}</b-list-group-item>
          </b-list-group>
            <b-table striped hover :items="listRuns" :fields="fields" responsive @row-clicked="rowClickHandler">
            <template v-slot:cell(image)="row">
              <b-img src="https://picsum.photos/1024/400/?image=41" fluid  rounded blank-color="#777" img-lazy thumbnail alt="Image unavailabe"></b-img>
              <!-- <b-img :src="getJpeg(row.item.image_url)" fluid  rounded blank-color="#777" img-lazy thumbnail alt="Responsive image"></b-img> -->
            </template>
          </b-table>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import ErrorCard from '@/components/utils/ErrorCard.vue';

export default {
  components: { ErrorCard },
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
        const response = await this.$api.get(requestUrl);
        this.catalogs = response.data;
        if (this.catalogs.length === 0) {
          this.noCatalogs = true;
        }
        this.showCatalogs = true;
      } catch (error) {
        this.somethingWentWrong = true;
      }
    },
  },

};
</script>
