<template>
  <div class="search-page">
    <h3 v-if="noResults" class="pt-4">Sorry, we couldn't find anything</h3>
    <div v-if="searchResults.length!=0" id="search-results" class="container-fluid">
      <div class="search-result" v-for="(result, i) in searchResults" :key="i">
        <div class="row">
            <div class="col-xl-6 ml-sm-4 ml-xs-0">
                <h4>Document:</h4>
                <pre>{{JSON.stringify(result, '\n', 4)}}</pre>
                <!--<div class="row">
                    <div class="col-sm-6">
                        <p><b>Researcher</b>: {{result.researcherName}}</p>
                        <p><b>Group</b>: {{result.researcherGroup}}</p>
                        <p><b>Solutes Present</b>:
                        <span v-for="(solute, i) in result.solutesPresent" v-bind:key="i">
                          {{ solute }},
                          </span></p>
                    </div>
                    <div class="col-sm-6">
                        <p><b>Polymer</b>: {{result.polymer}}</p>
                        <p><b>Institution</b>: {{result.researcherInstitution}}</p>
                    </div>
                </div>-->
            </div>
        </div>
      </div>
    </div>

    <div class="footer navbar fixed-bottom justify-content-center">
      <b-pagination-nav
        v-if="totalPages > 1 && currPageOnNextTick != 0"
        :link-gen="linkGen"
        :number-of-pages="totalPages"
        :value="currPageOnNextTick"
        use-router
      />

    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchPage',
  data() {
    return {
      searchResults: [],
      totalPages: 0,
      noResults: false,
      /* For some reason we need two separate current page references
      currPageOnNextTick is referenced by the b-pagination-nav component
      it is updated on nextTick inside the search function. If we don't do this,
      and I really have no idea why, the b-pagination-nav will go crazy and be buggy,
      maybe it has something to do with the DOM cycle being weird? */
      currPageOnNextTick: 0,
    };
  },
  computed: {
    /* this is the computed property that is referenced by axios
    when it makes a request to elastic */
    currPageComputed() {
      return this.$route.query.page;
    },
  },
  methods: {
    linkGen(pageNum) {
      return {
        path: '/search/',
        query: {
          query: this.$route.query.query,
          page: pageNum,
        },
      };
    },

    removeProjections(results) {
      results.forEach((hit) => {
        // eslint-disable-next-line no-underscore-dangle
        // eslint-disable-next-line no-param-reassign
        delete hit._source.projections;
      });
    },

    async search() {
      try {
        const ENDPOINT = this.$elastic_index_url;
        this.searchResults = [];
        if (
          !this.currPageComputed
          || !Number.isInteger(Number(this.currPageComputed))
          || Number(this.currPageComputed) <= 0
        ) {
          this.$router.replace({
            path: 'search',
            query: { query: this.$route.query.query, page: 1 },
          });
          return;
        }
        const page = Number(this.currPageComputed);
        let res;
        /* this is where we update the current page that is referenced
          by b-pagination-nav to prevent buggy behavior */
        this.$nextTick().then(() => {
          this.currPageOnNextTick = this.$route.query.page;
        });

        if (!this.$route.query.query) {
          res = await this.$search.post(ENDPOINT, {
            from: (page - 1) * 10,
            query: {
              match_all: {},
            },
          });
          this.removeProjections(res.data.hits.hits);
          this.searchResults = res.data.hits.hits;
          if (this.searchResults.length === 0) this.noResults = true;
          this.totalPages = Math.ceil(res.data.hits.total.value / 10);
          return;
        }

        res = await this.$search
          .post(ENDPOINT, {
            from: (page - 1) * 10,
            query: {
              multi_match: {
                query: this.$route.query.query,
                minimum_should_match: '3<90%',
              },
            },
          });
        // TODO: investigate more than 10,000 results edge case with elasticsearch

        // if no results, query again but this time allow fuzziness
        if (res.data.hits.hits.length === 0) {
          res = await this.$search.post(ENDPOINT, {
            from: (page - 1) * 10,
            query: {
              multi_match: {
                query: this.$route.query.query,
                fuzziness: 'AUTO',
                minimum_should_match: '3<90%',
              },
            },
          });
        }
        this.removeProjections(res.data.hits.hits);
        this.totalPages = Math.ceil(res.data.hits.total.value / 10);
        this.searchResults = res.data.hits.hits;
        if (this.searchResults.length === 0) this.noResults = true;
      } catch (error) {
        if ('request' in error && 'config' in error) {
          console.log(error);
          console.log(error.response);
        } else {
          throw error;
        }
      // TODO: better catch statement
      }
    },
  },
  watch: {
    $route() {
      this.noResults = false;
      this.search();
    },
  },

  mounted() {
    this.noResults = false;
    this.search();
  },
};
</script>

<style scoped>
#search-results {
  text-align: left;
  color: black;
  font-size: small;
}

</style>
