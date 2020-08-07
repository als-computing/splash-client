<template>
  <!--I got some of the search code from here https://alligator.io/vuejs/vue-autocomplete-component/ -->
  <div class="search-component col-lg-5 mx-auto" v-if=isLoggedIn>
    <div class="search-bar-pink">
      <b-input-group>
        <b-form-input
          v-model="displayedSearchInput"
          placeholder="Search"
          class="form-control search-bar"
          type="text"
           @keydown.enter="onEnter"
        ></b-form-input>
        <!-- NOTE THESE THINGS WOULD GO INSIDE the
          b-form-input tag, however we are disabling autocomplete
          functionality for now
          @input="updateSuggestions"
          @keydown.down="onArrowDown"
          @keydown.up="onArrowUp"
          @keydown.esc="handleEsc"
        -->
        <b-input-group-append>
          <b-button class="search-button" size="sm" text="Button" @click="goToSearch">Search</b-button>
        </b-input-group-append>
      </b-input-group>
      <ul v-show="suggestions.length>0" class="autocomplete-results">
        <li
          v-for="(suggestion, i) in suggestions"
          :key="i"
          class="autocomplete-result dropdown-item"
          :class="{ 'is-active': i === arrowCounter, 'fuzzy': isFuzzy(i) }"
          @click="onClick(suggestion)"
        >{{suggestion}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import queries from './elastic_queries';

export default {
  name: 'SearchBar',
  data() {
    return {
      suggestions: [],
      arrowCounter: -1,
      displayedSearchInput: '',
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters['login/isLoggedIn'];
    },
  },
  methods: {
    updateSuggestions() {
      const ENDPOINT = this.$elastic_index_url;
      queries.AUTOCOMPLETE.suggest.text = this.displayedSearchInput;
      this.$search.post(ENDPOINT, queries.AUTOCOMPLETE).then((res) => {
        // console.log(res)
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
        queries.FUZZY_AUTOCOMPLETE.suggest.text = this.displayedSearchInput;
        if (this.suggestions.length === 0) {
          return this.$search.post(ENDPOINT, queries.FUZZY_AUTOCOMPLETE);
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
        this.arrowCounter += 1;
      } else {
        this.arrowCounter = -1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter >= 0) {
        this.arrowCounter -= 1;
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
.search-bar-pink input[type="text"]:focus:not([readonly]) {
  border: 1px solid #23afc2;
  box-shadow: 0 0 0 1px #23afc2;
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
.autocomplete-result.is-active {
  background-color: #4aae9b;
  color: white;
}
.fuzzy {
  font-weight: bold;
}
.borderless-list-group * {
  border: 0;
}
</style>
