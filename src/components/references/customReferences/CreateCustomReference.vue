<template>
  <div>
    <h4 class="ml-3 mt-3 text-left" >Create a Reference</h4>
    <b-card title="fffff" no-body>
      <b-tabs @activate-tab="handleChangeTab" card>
        <b-tab title="DOI" active align="left" lazy>
          <doi-input
            @input="
              showDOIHandler = false;
              DOIForHandler = $event;
            "
            :disabled="loading"
          >
            <template v-slot:button>
              <b-button
                class="search-button"
                size="sm"
                text="Button"
                :disabled="
                  loading ||
                  DOIForHandler === undefined ||
                  DOIForHandler === null
                "
                @click="allowCustomReferenceWithExistingDoi = false; reRenderDoiHandler()"
                >Find DOI</b-button
              >
            </template>
          </doi-input>
        </b-tab>
        <b-tab title="Journal article">
          <journal-citation-form
            @createRef="handleCustomRefObj"
            @reset="keys.journalKey += 1; resetState();"
            :key="keys.journalKey"
            :disabled="loading"
          />
        </b-tab>

        <b-tab title="Web page">
          <website-citation-form
            @createRef="handleCustomRefObj"
            @reset="keys.webpageKey += 1; resetState();"
            :key="keys.webpageKey"
            :disabled="loading"
          />
        </b-tab>

        <b-tab title="Book">
          <book-citation-form
            @createRef="handleCustomRefObj"
            @reset="keys.bookKey += 1; resetState();"
            :key="keys.bookKey"
            :disabled="loading"
          />
        </b-tab>
      </b-tabs>
      <b-card align="left">
        <doi-handler
          @loading="loading = true"
          @not-loading="loading = false"
          @insert-ref="addRef"
          @not-found="handleDOINotFound"
          @cancel="showDOIHandler = false"
          @use-custom-ref="handleDOINotFound"
          v-if="showDOIHandler"
          :DOI="DOIForHandler"
          :allow-custom-reference-with-existing-doi="allowCustomReferenceWithExistingDoi"
          connectionErrMsg="Connection Error. Try again or try reloading the page."
          foundInServiceMsg="The DOI for this reference was found in an external service:"
          foundInSplashMsg="The DOI for this reference already exists in Splash:"
        />

        <reference-handler
          @loading="loading = true"
          @not-loading="loading = false"
          @insert-ref="addRef"
          @cancel="showRefHandler = false"
          v-if="showRefHandler"
          :custom-reference="referenceForHandler"
          connectionErrMsg="Connection Error. Try again or try reloading the page."
          foundInServiceMsg="The DOI for this reference was found in an external service:"
          foundInSplashMsg="The DOI for this reference already exists in Splash:"
        />
      </b-card>
    </b-card>
  </div>
</template>
<script>
import JournalCitationForm from './citationForms/JournalCitationForm.vue';
import WebsiteCitationForm from './citationForms/WebsiteCitationForm.vue';
import ReferenceAndDOIHandler from '../shared/ReferenceAndDOIHandler.vue';
import BookCitationForm from './citationForms/BookCitationForm.vue';
import DoiInput from '../shared/DoiInput.vue';

export default {
  props: {
    alreadyFoundButtonText: {
      default: 'Insert',
      type: String,
    },
  },
  components: {
    JournalCitationForm,
    'doi-handler': ReferenceAndDOIHandler,
    'reference-handler': ReferenceAndDOIHandler,
    DoiInput,
    WebsiteCitationForm,
    BookCitationForm,
  },
  data() {
    return {
      keys: {
        bookKey: 0,
        journalKey: 0,
        webpageKey: 0,
      },
      DOIForHandler: undefined,
      referenceForHandler: undefined,
      showDOIHandler: false,
      showRefHandler: false,
      loading: false,
      citationHTML: '',
      allowCustomReferenceWithExistingDoi: false,
    };
  },
  methods: {
    resetState() {
      this.showDOIHandler = false;
      this.showRefHandler = false;
      this.referenceForHandler = undefined;
      this.DOIForHandler = undefined;
      this.citationHTML = '';
      this.allowCustomReferenceWithExistingDoi = false;
    },
    handleChangeTab(newTabInd, prevTabInd, bvEvent) {
      if (this.loading === true) {
        bvEvent.preventDefault();
        return;
      }
      this.resetState();
    },
    async handleCustomRefObj(reference) {
      this.resetState();
      // If we're citing a chapter or book then we want to allow the user
      // to associate their custom reference with an already existing DOI
      if (reference.type === 'chapter' || reference.type === 'book') {
        this.allowCustomReferenceWithExistingDoi = true;
        this.passRefObj(reference);
        return;
      }
      this.allowCustomReferenceWithExistingDoi = false;
      this.passRefObj(reference);
    },
    passRefObj(reference) {
      this.referenceForHandler = reference;
      if (reference.DOI !== undefined) {
        this.DOIForHandler = reference.DOI;
        this.reRenderDoiHandler();
        return;
      }
      this.reRenderReferenceHandler();
    },
    handleDOINotFound() {
      // Basically if we are only trying to create a reference
      // using the find DOI feature then we don't have a custom reference to create
      if (this.referenceForHandler === undefined) return;
      this.loading = false;
      this.showDOIHandler = false;
      this.reRenderReferenceHandler();
    },
    async reRenderReferenceHandler() {
      this.showRefHandler = false;
      await this.$nextTick();
      this.showRefHandler = true;
    },
    async reRenderDoiHandler() {
      this.showDOIHandler = false;
      await this.$nextTick();
      this.showDOIHandler = true;
    },
    addRef(inTextCitation, uid, html) {
      this.$emit('add-ref', inTextCitation, uid, html);
    },
  },
};

</script>

<style scoped>
.small-text {
  font-size: 0.73em;
}
</style>
