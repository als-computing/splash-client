<template>
  <div>
  <h1>Pages</h1>
    <create-page button-text="Create New Page" form-text="Page Title" page-type="generic_page" modal-title="Enter Page Title"/>
    <b-table
      striped
      hover
      :items="myProvider"
      :fields="fields"
      responsive="true"
      @row-clicked="rowClickHandler"
    >
    </b-table>
  </div>
</template>

<script>
import CreatePage from '@/components/CreatePage.vue';

export default {
  data() {
    return {
      fields: [{ key: 'title', label: 'Title' }],
    };
  },

  // created(){

  // },
  methods: {
    myProvider(ctx, callback) {
      const config = { headers: { 'Content-Type': 'application/json' } };
      this.$api
        .get(this.$pages_url, config)
        .then((response) => {
          callback(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    rowClickHandler(page) {
      this.$router.push({ path: `pages/${page.uid}` });
    },
  },
  components: {
    'create-page': CreatePage,
  },
};
</script>

<style>
#edit-container {
  margin: 5px;
  height: 40px;
}
#mfp_main {
  font-size: 0.7em;
}
</style>
