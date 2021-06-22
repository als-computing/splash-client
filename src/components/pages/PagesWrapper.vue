<template>
  <div>
    <b-container fluid>
      <b-row align-h="end" >
      <b-col lg="4" align-self="end"  ><h1>{{title}}</h1></b-col>
      <b-col lg="4" align-self="end"><create-page
      :default-documentation="defaultDocumentation"
      :button-text="buttonText"
      :form-text="formText"
      :modal-title="modalTitle"
      :pageType="pageType === undefined ? 'generic_page' : pageType"
      v-if="error === false"
    /></b-col>
      </b-row>
    </b-container>
    <b-container>
      <b-row>
        <error-card class="mt-5" v-if="error === true" />
      </b-row>
    </b-container>
     <list-pages
      :page-type="pageType"
      v-if="error === false"
      :hide-category="hideCategory"
      @errorConnecting="error = true"
    />
  </div>
</template>
<script>
import CreatePage from './CreatePage.vue';
import ErrorCard from '../ErrorCard.vue';
import ListPages from './ListPages.vue';

export default {
  components: { ErrorCard, ListPages, CreatePage },
  props: {
    title: String,
    buttonText: String,
    formText: String,
    pageType: String,
    modalTitle: String,
    defaultDocumentation: String,
    hideCategory: Boolean,
  },
  data() {
    return {
      error: false,
    };
  },
};
</script>
