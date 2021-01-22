<template>
  <div>
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
export default {
  props: {
    pageType: String,
  },
  data() {
    return {
      fields: [{ key: 'title', label: 'Title' }],
      error: false,
    };
  },

  // created(){

  // },
  methods: {
    myProvider(ctx, callback) {
      const config = { headers: { 'Content-Type': 'application/json' } };
      if (this.pageType === undefined) {
        this.$api
          .get(this.$pages_url, config)
          .then((response) => {
            callback(response.data);
          })
          .catch((e) => {
            console.log(e);
            this.$emit('errorConnecting');
          });
      } else {
        this.$api
          .get(`${this.$pages_url}/page_type/${this.pageType}`, config)
          .then((response) => {
            callback(response.data);
          })
          .catch((e) => {
            console.log(e);
            this.$emit('errorConnecting');
          });
      }
    },
    rowClickHandler(page) {
      this.$router.push({ path: `pages/${page.uid}` });
    },
  },
};
</script>
