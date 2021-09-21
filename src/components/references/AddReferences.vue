<template>
  <div class="documentation_editor">
    <div align="left">
      <b-card title="Search Splash For References">
        <mongo-search
          query-key="search"
          :query-endpoint="$references_url"
          placeholder="Search References"
          @updatedResults="items = arguments[0]"
        />
        <splash-reference-list :referenceList="items" @clickedRef="plusClickHandler"/>
      </b-card>

    </div>
  </div>
</template>

<script>
import MongoSearch from '@/components/MongoSearch.vue';
import SplashReferenceList from './shared/SplashReferenceList.vue';

export default {
  props: {
    alreadyFoundButtonText: {
      type: String,
      default: 'Insert',
    },
  },
  data() {
    return {
      items: [],

    };
  },
  methods: {
    plusClickHandler(inTextCitation, doi, html) {
      this.$emit('clickedRef', inTextCitation, doi, html);
    },
  },
  components: {
    MongoSearch,
    SplashReferenceList,
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
.text-red {
  color: red;
}

.active {
  background-color: yellowgreen;
}
</style>
