<template>
  <div class="search-page">
    <h3 v-if="noResults" class="pt-4">Sorry, we couldn't find anything</h3>
    <div v-if="searchResults.length!=0" id="search-results" class="container-fluid">
      <div class="search-result" v-for="(result, i) in searchResults" :key="i">
        <div class="row">
            <div class="col-xl-6 ml-sm-4 ml-xs-0">
                <h4>{{result.experimentName}}</h4>
                <div class="row">
                    <div class="col-sm-6">
                        <p><b>Researcher</b>: {{result.researcherName}}</p>
                        <p><b>Group</b>: {{result.researcherGroup}}</p>
                        <p><b>Solutes Present</b>:
                        <span v-for="(solute, i) in result.solutesPresent" v-bind:key="i">{{ solute }},</span></p>
                    </div>
                    <div class="col-sm-6">
                        <p><b>Polymer</b>: {{result.polymer}}</p>
                        <p><b>Institution</b>: {{result.researcherInstitution}}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <div class="footer navbar fixed-bottom justify-content-center">
      <b-pagination-nav
        v-if="totalPages > 1 && currPageAsync != 0"
        :link-gen="linkGen"
        :number-of-pages="totalPages"
        :value="currPageAsync"
        use-router
      />
    </div>
  </div>
</template>

<script>
import SearchBar from "@/components/SearchBar.vue";
import axios from 'axios';
    var axiosInst = axios.create({
        baseURL: "http://127.0.0.1:9200/",
        headers: {
            'Content-Type': "application/json"
        }
    })

export default {
  name: "SearchPage",
  components: {
    SearchBar
  },
  data() {
    return {
      searchResults: [],
      totalPages: 0,
      noResults: false,
      /* For some reason we need two separate current page references
      currPageAsync is referenced by the b-pagination-nav component
      it is updated on nextTick inside the search function. If we don't do this, and I really have no idea why
      the b-pagination-nav will go crazy and be buggy, maybe it has something to do with
      the DOM cycle being weird? */
      currPageAsync: 0
    };
  },
  computed: {
    /* this is the computed property that is referenced by axios
    when it makes a request to elastic */
    currPageComputed() {
      return this.$route.query.page;
    }
  },
  methods: {
    linkGen(pageNum) {
      return {
        path: "/search/",
        query: {
          query: this.$route.query.query,
          page: pageNum
        }
      };
    },

    search() {
      this.searchResults = [];
      let page;
      if (!this.$route.query.query) this.$router.replace("/");
      else {
        if (
          !this.currPageComputed ||
          !Number.isInteger(Number(this.currPageComputed)) ||
          Number(this.currPageComputed) <= 0
        ) {
          this.$router.replace({
            path: "search",
            query: { query: this.$route.query.query, page: 1 }
          });
        }
        page = Number(this.currPageComputed);

        axiosInst
          .post("/research_experiments/_search", {
            from: (page - 1) * 10,
            query: {
              multi_match: {
                query: this.$route.query.query,
                fields: [
                  "name",
                  "researcher.name",
                  "researcher.group",
                  "researcher.institution",
                  "trials.solutes_present",
                  "trials.membrane_or_polymer"
                ],
                minimum_should_match: "3<90%"
              }
            }
          })
          .then(res => {
            // TODO: investigate more than 10,000 results edge case with elasticsearch

            /* this is where we update the current page that is referenced 
          by b-pagination-nav to prevent buggy behavior */
            this.$nextTick().then(() => {
              this.currPageAsync = this.$route.query.page;
            });
            this.searchResults = [];

            this.totalPages = Math.ceil(res.data.hits.total.value / 10);
            res.data.hits.hits.forEach(element => {
              const result = {};
              // eslint-disable-next-line no-underscore-dangle
              result.experimentName = element._source.name;
              // eslint-disable-next-line no-underscore-dangle
              result.researcherName = element._source.researcher.name;
              // eslint-disable-next-line no-underscore-dangle
              result.researcherInstitution =
                element._source.researcher.institution;
              // eslint-disable-next-line no-underscore-dangle
              result.solutesPresent = element._source.trials[0].solutes_present.slice();
              // eslint-disable-next-line no-underscore-dangle
              result.polymer = element._source.trials[0].membrane_or_polymer;
              // eslint-disable-next-line no-underscore-dangle
              result.researcherGroup = element._source.researcher.group;

              this.searchResults.push(result);
            });
            /* TODO: Implement things like did you mean functionality
          to stop na- from turning up na+ automatically. */

            // if no results, query again but this time allow fuzziness
            if (this.searchResults.length === 0) {
              return axiosInst.post("/research_experiments/_search", {
                from: (page - 1) * 10,
                query: {
                  multi_match: {
                    query: this.$route.query.query,
                    fields: [
                      "name",
                      "researcher.name",
                      "researcher.group",
                      "researcher.institution",
                      "trials.solutes_present",
                      "trial.membrane_or_polymer"
                    ],
                    fuzziness: "AUTO",
                    minimum_should_match: "3<90%"
                  }
                }
              });
            }
            // signify that we do not need a fuzzy query
            return 0;
          })
          .then(res => {
            // No need to perform a display fuzzy results
            if (res === 0) {
              return Promise.resolve();
            }
            this.totalPages = Math.ceil(res.data.hits.total.value / 10);
            this.searchResults = [];
            res.data.hits.hits.forEach(element => {
              const result = {};
              // eslint-disable-next-line no-underscore-dangle
              result.experimentName = element._source.name;
              // eslint-disable-next-line no-underscore-dangle
              result.researcherName = element._source.researcher.name;
              // eslint-disable-next-line no-underscore-dangle
              result.researcherInstitution =
                element._source.researcher.institution;
              // eslint-disable-next-line no-underscore-dangle
              result.solutesPresent = element._source.trials[0].solutes_present.slice();
              // eslint-disable-next-line no-underscore-dangle
              result.polymer = element._source.trials[0].membrane_or_polymer;
              // eslint-disable-next-line no-underscore-dangle
              result.researcherGroup = element._source.researcher.group;
              this.searchResults.push(result);
            });
            if (this.searchResults.length === 0) this.noResults = true;
            return Promise.resolve();
          })
          .catch(error => {
            if ("request" in error && "config" in error) {
              console.log(error);
              console.log(error.response);
            } else {
              throw error;
            }
          }); // TODO: better catch statement
      }
    }
  },
  watch: {
    $route() {
      this.noResults = false;
      this.search();
    }
  },

  mounted() {
    this.noResults = false;
    this.search();
  }
};
</script>

<style scoped>
#search-results {
  text-align: left;
  color: black;
  font-size: small;
}

</style>
