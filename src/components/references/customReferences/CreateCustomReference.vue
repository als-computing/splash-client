<template>
  <div>
    <b-button
      variant="link"
      class="text-decoration-none small-text mt-2 mb-2"
      v-b-toggle.custom-reference-collapse
    >
      Don't have a DOI or we can't find it? Create a custom reference.
    </b-button>
    <b-collapse id="custom-reference-collapse">
      <b-tabs @activate-tab="checkChangeTab">
        <b-tab title="Journal Article" active>
          <journal-citation-form @createRef="checkDOI" :disabled="loading" />
        </b-tab>

        <b-tab title="Website">
          <b-card>
            <b-input-group prepend="Author" class="mb-2">
              <b-form-input placeholder="Last name"></b-form-input>
              <b-form-input placeholder="First name"></b-form-input>
            </b-input-group>
          </b-card>
        </b-tab>
      </b-tabs>
      <b-card align="left">
        <doi-handler
          @loading="loading = true"
          @not-loading="loading = false"
          @insert-ref="addRef"
          v-if="showDOIHandler"
          :DOI="DOIToHandle"
          connectionErrMsg='Connection Error. Try clicking "Create" again or reloading.'
          foundInServiceMsg="The DOI for this reference was found in an external service:"
          foundInSplashMsg="The DOI for this reference already exists in Splash:"
        />
      </b-card>
    </b-collapse>
  </div>
</template>
<script>
import JournalCitationForm from './citationForms/JournalCitationForm.vue';
import DOIHandler from '../shared/DOIHandler.vue';
import utils from '../utils';

export default {
  props: {
    alreadyFoundButtonText: {
      default: 'Insert',
      type: String,
    },
  },
  components: {
    JournalCitationForm,
    'doi-handler': DOIHandler,
  },
  data() {
    return {
      DOIToHandle: '',
      showDOIHandler: false,
      loading: false,
      reference: {},
      citationHTML: '',
    };
  },
  methods: {
    handleConnErr() {

    },
    checkChangeTab(newTabInd, prevTabInd, bvEvent) {
      if (this.loading === true) {
        bvEvent.preventDefault();
      }
    },
    async reRenderDoiHandler() {
      this.showDOIHandler = false;
      await this.$nextTick();
      this.showDOIHandler = true;
    },
    async checkDOI(reference) {
      this.reference = reference;
      if (reference.DOI !== undefined) {
        this.DOIToHandle = this.reference.DOI;
        await this.reRenderDoiHandler();
        return;
      }
      await this.displayReference('user', reference);
    },
    async displayReference(where, reference) {
      if (where === 'service') {
        this.reference = reference;
        this.citationHTML = utils.generateHtmlCitation(reference);
        this.createReferenceFlags.found = true;
      }
    },
    addRef(inTextCitation, doi, html) {
      this.$emit('add-ref', inTextCitation, doi, html);
    },
  },
};

</script>

<style scoped>
.small-text {
  font-size: 0.73em;
}
</style>
