<template>
  <div>
  <h1>Pages</h1>
    <pages-wrapper button-text="Create Uncategorized Page" form-text="Page Title" modal-title="Enter Page Title"/>
  </div>
</template>

<script>
import PagesWrapper from '../components/pages/PagesWrapper.vue';


export default {
  components: { PagesWrapper },

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
