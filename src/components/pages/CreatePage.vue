<template>
  <div>
    <b-modal
    :title="modalTitle"
      v-model="create_modal"
      ok-title="Create"
      @ok="create"
      :id="_uid+'creation-modal'"
      :ok-disabled="title === '' || loading"
    >
    <b-form-input :placeholder="formText" v-model="title" @input="error = false" ></b-form-input>
    <b-spinner v-show="loading"/>
    <b-alert dismissible fade v-model="error" variant="warning">{{errorMessage}}</b-alert>
    </b-modal>
    <b-button @click="create_modal = true">{{buttonText}}</b-button>
  </div>
</template>

<script>
export default {
  props: {
    buttonText: {
      type: String,
      default: 'Create New',
    },
    formText: {
      type: String,
      default: 'Title',
    },
    pageType: {
      type: String,
      required: true,
    },
    modalTitle: {
      type: String,
      default: 'Enter The Title',
    },
    errorMessage: {
      type: String,
      default: 'Error creating. Try clicking "Create" again or reloading the page.',
    },
  },
  data() {
    return {
      create_modal: false,
      title: '',
      loading: false,
      error: false,
    };
  },

  // created(){

  // },
  methods: {
    async create(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.error = false;
      this.loading = true;
      try {
        const document = {
          page_type: this.pageType,
          title: this.title,
          documentation: [],
          metadata: [],
        };
        const response = await this.$api.post(this.$pages_url, document);
        this.$router.push({ path: `pages/${response.data.uid}` });
      } catch (e) {
        this.error = true;
      }
      this.loading = false;
      this.$bvModal.hide('modal-prevent-closing');
    },
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
