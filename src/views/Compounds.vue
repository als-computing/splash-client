<template>
  <div>
  <h1>Compounds</h1>
    <pages-wrapper button-text="Create Compound Page" form-text="Page Title" page-type="compound" modal-title="Enter Compound Name"/>
  </div>
</template>

<script>
import PagesWrapper from '../components/pages/PagesWrapper.vue';

export default {
  components: {
    PagesWrapper,
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
