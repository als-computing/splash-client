<template>
  <div>
  <h1>Compounds</h1>
    <create-page button-text="Create Compound Page" form-text="Page Title" page-type="compound" modal-title="Enter Compound Name"/>
    <list-pages pageType="compound"/>
  </div>
</template>

<script>
import CreatePage from '@/components/CreatePage.vue';
import ListPages from '@/components/ListPages.vue';

export default {
  components: {
    'create-page': CreatePage,
    'list-pages': ListPages,
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
