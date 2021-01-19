<template>
  <div>
  <h1>Pages</h1>
    <create-page button-text="Create Uncategorized Page" form-text="Page Title" page-type="generic_page" modal-title="Enter Page Title"/>
    <list-pages/>
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
