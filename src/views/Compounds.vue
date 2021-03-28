<template>
  <div>
    <h1>Compounds</h1>
    <pages-wrapper
      button-text="Create Compound Page"
      form-text="Page Title"
      page-type="compound"
      modal-title="Enter Compound Name"
      :hide-category="true"
      :default-documentation=defaultDocumentation
    />
  </div>
</template>

<script>
import PagesWrapper from '../components/pages/PagesWrapper.vue';

export default {
  components: {
    PagesWrapper,
  },
  data() {
    return {
      defaultDocumentation: '# Relevance to MWET\n# Physiochemical Properties\n# Analysis',
    };
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
