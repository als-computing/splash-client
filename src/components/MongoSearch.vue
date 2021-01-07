<template>
  <div>
    <b-form-input
      v-model="query"
      @input="
        connectionError = false;
        search();
      "
      :placeholder="placeholder"
      class="form-control search-bar"
      type="text"
    ></b-form-input>
    <h4 v-show="!connectionError && results.length === 0 && query !== ''">No results found</h4>
     <b-alert
          v-model="connectionError"
          dismissible
          align="center"
          fade
          variant="warning"
        >
         Connection Error. If it persists, try reloading the page.
        </b-alert>
  </div>
</template>

<script>
export default {
  name: 'MongoSearch',
  props: {
    buttonText: String,
    queryKey: String,
    queryEndpoint: String,
    fieldsArray: Array,
    placeholder: String,
  },
  data() {
    return {
      query: '',
      arrowCounter: -1,
      displayedSearchInput: '',
      saving: false,
      connectionError: false,
      results: [],
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters['login/isLoggedIn'];
    },
  },
  mounted() {},
  methods: {
    async search() {
      if (this.query === '') {
        this.$emit('updatedResults', []);
        return;
      }
      const config = {
        headers: { 'Content-Type': 'application/json' },
        params: {
          [this.queryKey]: this.query,
        },
      };
      try {
        const response = await this.$api.get(this.queryEndpoint, config);
        this.results = response.data;
        this.$emit('updatedResults', response.data);
      } catch (e) {
        this.connectionError = true;
        this.results = [];
        this.$emit('updatedResults', []);
      }
    },
  },
};
</script>
