<template>
  <!--I got some of the search code from here https://alligator.io/vuejs/vue-autocomplete-component/ -->
  <div class="search-component col-lg-5 mx-auto" v-if=isLoggedIn>
    <div class="search-bar-pink">
      <b-input-group>
        <b-form-input
          v-model="query"
          @input="search"
          :placeholder="placeholder"
          class="form-control search-bar"
          type="text"
        ></b-form-input>

      </b-input-group>
          <b-table striped hover  :items="foundObjects" :fields="fields" responsive="true" >
              <template v-slot:cell(select)="row">
                <b-button
                  :disabled="saving || foundObjects[row.index].disabled"
                  @click="select(row.item, row.index, $event.target)"
                >
                 Add
                </b-button>
              </template>
          </b-table>

    </div>
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
    uids: Array,
  },
  data() {
    return {
      foundObjects: [],
      query: '',
      arrowCounter: -1,
      displayedSearchInput: '',
      fields: [],
      saving: false,
    };
  },
  watch: {
    uids: {
      deep: true,
      immediate: true,
      handler() {
        this.disableResults(this.foundObjects);
      },
    },
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters['login/isLoggedIn'];
    },
  },
  mounted() {
    this.fields = this.fieldsArray.slice();
    this.fields.push('select');
  },
  methods: {
    // TODO: Make this trim the results instead,
    // however, this will require that if too many are trimmed
    // another request is sent

    async emitToParent(data) {
      // This emits an object with the altered data, and
      // a callback for the parent component to call with a boolean as the argument,
      // so that this component can know whether not the data was saved succesfully
      // if the data was succesfully saved then the code will execute as normal.
      // if not then this function will throw an error
      // Partly inspired by how this programmer awaits a settimeout https://stackoverflow.com/a/51939030/8903570
      return new Promise((resolve, reject) => this.$emit('dataToParent', {
        data,
        callback: (success) => {
          if (success) {
            resolve();
          } else {
            reject();
          }
        },
      }));
    },
    disableResults(results) {
      const { uids } = this;
      results.forEach((elem, index) => {
        if (uids.includes(elem.uid)) {
          results[index].disabled = true;
        } else {
          results[index].disabled = false;
        }
      });
    },
    async search() {
      if (this.query === '') {
        this.foundObjects = [];
        return;
      }
      const config = {
        headers: { 'Content-Type': 'application/json' },
        params: {
          [this.queryKey]: this.query,
        },
      };
      const response = await this.$api.get(this.queryEndpoint, config);
      this.disableResults(response.data);
      this.foundObjects = response.data;
    },
    async select(object) {
      try {
        this.saving = true;
        await this.emitToParent(object);
        this.saving = false;
      } catch (e) {
        this.saving = false;
        console.log(e);
      }
    },
  },

};
</script>
