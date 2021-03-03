<template>
  <div>
    <create-page
      :default-documentation="defaultDocumentation"
      :button-text="buttonText"
      :form-text="formText"
      :modal-title="modalTitle"
      :pageType="pageType === undefined ? 'generic_page' : pageType"
      v-if="error === false"
    />
    <list-pages
      :page-type="pageType"
      v-if="error === false"
      @errorConnecting="error = true"
    />
    <b-container>
      <b-row>
        <error-card class="mt-5" v-if="error === true" />
      </b-row>
    </b-container>
  </div>
</template>
<script>
import CreatePage from './CreatePage.vue';
import ErrorCard from '../ErrorCard.vue';
import ListPages from './ListPages.vue';

export default {
  components: { ErrorCard, ListPages, CreatePage },
  props: {
    buttonText: String,
    formText: String,
    pageType: String,
    modalTitle: String,
    defaultDocumentation: String,
  },
  data() {
    return {
      error: false,
    };
  },
};
</script>
