<template>
<!--I got most of this code from here https://alligator.io/vuejs/vue-autocomplete-component/ -->
  <div class="search-component col-md-4 col-6 mx-auto">
    <div class="search-bar-pink">
      <b-input-group>
        <b-form-input
        v-model="displayedSearchInput"
        @input="updateSuggestions"
        placeholder="Search"
        class="form-control search-bar"
        type = "text"
        @keydown.down="onArrowDown"
        @keydown.up="onArrowUp"
        @keydown.enter="onEnter"
        @keydown.esc="handleEsc">
        </b-form-input>
        <b-input-group-append>
            <b-button class= "search-button" size="sm" text="Button" @click="goToSearch">Search</b-button>
        </b-input-group-append>
      </b-input-group>
      <ul v-show="suggestions.length>0"
      class="autocomplete-results">
        <li v-for="(suggestion, i) in suggestions"
        :key="i"
        class="autocomplete-result dropdown-item"
        :class="{ 'is-active': i === arrowCounter, 'fuzzy': isFuzzy(i) }"
        @click="onClick(suggestion)">
          {{suggestion}}
        </li>
    </ul>
    </div>
  </div>
</template>

<script>
const axios = require('axios');

axios.defaults.baseURL = 'http://127.0.0.1:9200';
axios.defaults.headers.post['Content-Type'] = 'application/json';
export default {
  name: 'SearchBar',
  data() {
    return {
      suggestions: [],
      arrowCounter: -1,
      displayedSearchInput: '',
    };
  },
  methods: {
    updateSuggestions() {
      axios.post('/research_experiments/_search',
        {
          _source: ['researcherNameSuggestions.options.text', 'experimentNameSuggestions.options.text', 'groupNameSuggestions.options.text', 'solutesSuggestions.options.text', 'polymerSuggestions.options.text', 'institutionSuggestions.options.text'],
          suggest: {
            text: this.displayedSearchInput,
            researcherNameSuggestions: {
              completion: {
                field: 'researcher.name.autocomplete',
                skip_duplicates: true,
              },
            },
            experimentNameSuggestions: {
              completion: {
                field: 'name.autocomplete',
                skip_duplicates: true,
              },
            },
            groupNameSuggestions: {
              completion: {
                field: 'researcher.group.autocomplete',
                skip_duplicates: true,
              },
            },
            solutesSuggestions: {
              completion: {
                field: 'trials.solutes_present.autocomplete',
                skip_duplicates: true,
              },
            },
            polymerSuggestions: {
              completion: {
                field: 'trials.membrane_or_polymer.autocomplete',
                skip_duplicates: true,
              },
            },
            institutionSuggestions: {
              completion: {
                field: 'researcher.institution.autocomplete',
                skip_duplicates: true,
              },
            },
          },
        }).then((res) => {
        //console.log(res)
        this.destroySuggestions();
        res.data.suggest.researcherNameSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.experimentNameSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.groupNameSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.polymerSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.solutesSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.institutionSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        // if no results perform a fuzzy query,
        // it's equal to 1 because the displayed input is always part of the suggested results
        if (this.suggestions.length === 0) {
          return axios.post('/research_experiments/_search',
            {
              _source: ['researcherNameSuggestions.options.text', 'experimentNameSuggestions.options.text', 'groupNameSuggestions.options.text', 'solutesSuggestions.options.text', 'polymerSuggestions.options.text', 'institutionSuggestions.options.text'],
              suggest: {
                text: this.displayedSearchInput,
                researcherNameSuggestions: {
  
                  completion: {
                    field: 'researcher.name.autocomplete',
                    fuzzy: {},
                    skip_duplicates: true,
                  },
                },
                experimentNameSuggestions: {
  
                  completion: {
                    field: 'name.autocomplete',
                    fuzzy: {},
                    skip_duplicates: true,
                  },
                },
                groupNameSuggestions: {
  
                  completion: {
                    field: 'researcher.group.autocomplete',
                    fuzzy: {},
                    skip_duplicates: true,
                  },
                },
                solutesSuggestions: {
  
                  completion: {
                    field: 'trials.solutes_present.autocomplete',
                    fuzzy: {},
                    skip_duplicates: true,
                  },
                },
                polymerSuggestions: {
  
                  completion: {
                    field: 'trials.membrane_or_polymer.autocomplete',
                    fuzzy: {},
                    skip_duplicates: true,
                  },
                },
                institutionSuggestions: {
  
                  completion: {
                    field: 'researcher.institution.autocomplete',
                    fuzzy: {},
                    skip_duplicates: true,
                  },
                },
              },
            });
        }
        // signify no fuzzy search was performed
        return 0;
      }).then((res) => {
        // skip the rest of the code
        if (res === 0) {
          this.cutSuggestions();
          return Promise.resolve();
        }
        res.data.suggest.researcherNameSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.experimentNameSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.groupNameSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.polymerSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.solutesSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        res.data.suggest.institutionSuggestions[0].options.forEach((element) => {
          this.suggestions.push(element.text.toLowerCase());
        });
        this.cutSuggestions();
        return Promise.resolve();
      }).catch((err) => {
        console.log(err);
        console.log(err.response);
      }); // TODO: make catch statement better
    },
    cutSuggestions() {
      if (this.suggestions.length > 10) {
        this.suggestions = this.suggestions.slice(0, 10);
        return true;
      }
      return false;
    },
    onArrowDown() {
      if (this.arrowCounter < this.suggestions.length - 1) {
        this.arrowCounter = this.arrowCounter + 1;
      } else {
        this.arrowCounter = -1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter >= 0) {
        this.arrowCounter = this.arrowCounter - 1;
      } else {
        this.arrowCounter = this.suggestions.length - 1;
      }
    },
    onEnter() {
      this.displayedSearchInput = this.suggestions[this.arrowCounter] || this.displayedSearchInput;
      this.destroySuggestions();
      this.goToSearch();
    },
    onClick(suggestion) {
      this.displayedSearchInput = suggestion;
      this.destroySuggestions();
      this.goToSearch();
    },
    goToSearch() {
      this.$router.push({ path: '/search', query: { query: this.displayedSearchInput } });
    },
    handleEsc() {
      this.destroySuggestions();
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.destroySuggestions();
      }
    },
    isFuzzy(arrPos) {
      if (!this.displayedSearchInput) return false;
      if (!this.suggestions[arrPos]) return false;
      const searchInputLen = this.displayedSearchInput.length;
      const resultPortion = this.suggestions[arrPos].slice(0, searchInputLen);
      if (this.displayedSearchInput.toLowerCase() !== resultPortion.toLowerCase()) {
        return true;
      }
      return false;
    },
    destroySuggestions() {
      this.suggestions = [];
      this.arrowCounter = -1;
    },

  },
  created() {
    document.addEventListener('click', this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .search-bar-pink input[type=text]:focus:not([readonly]) {
    border: 1px solid #f48fb1;
    box-shadow: 0 0 0 1px #f48fb1;
  }

  .search-bar {
    position: static;
  }

  .search-component {
    position: relative;
  }

  .autocomplete-results {
    padding: 0;
    margin: 0;
    border: 1px solid #eeeeee;
    background: #ffff;
    height: auto;
    position: absolute;
    display: inline-block;
    right: 0;
    left: 0;
    z-index: 5;
  }

  .autocomplete-result {
    list-style: none;
    text-align: left;
    padding: 4px 2px;
    cursor: pointer;
  }

  .autocomplete-result:hover {
    background-color: rgba(81, 83, 83, 0.082);
    color: black;
  }
  .autocomplete-result.is-active{
    background-color: #4AAE9B;
    color: white;
  }
  .fuzzy {
    font-weight: bold;
  }
  .borderless-list-group * { border: 0; }
</style>
