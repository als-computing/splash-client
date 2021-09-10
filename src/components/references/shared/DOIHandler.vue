<template>
  <div>
    <b-alert
      v-if="alertNotFound"
      v-model="createReferenceFlags.notFound"
      dismissible
      align="center"
      fade
      variant="warning"
    >
      DOI cannot be found. Double check if it's correct.
    </b-alert>
    <b-alert
      v-model="createReferenceFlags.connectionError"
      dismissible
      align="center"
      fade
      variant="warning"
    >
      {{ connectionErrMsg }}
    </b-alert>
    <div v-if="createReferenceFlags.alreadyExists">
      <h5>{{ foundInSplashMsg }}</h5>
      <span v-html="citationHTML"></span>
      <b-button
        @click="
          insertRefHandler(inTextCitation, DOI, citationHTML)
        "
        >{{ alreadyFoundButtonText }}</b-button
      >
    </div>
    <div v-if="createReferenceFlags.found">
      <h5>{{foundInServiceMsg}}</h5>
      <span v-html="citationHTML"></span>
      <b-button
        @click="
          createReferenceFlags.creationError = false;
          loader(addNewReference, [DOI]);
        "
        >Create New</b-button
      >
      <b-alert
        v-model="createReferenceFlags.creationError"
        dismissible
        align="center"
        fade
        variant="warning"
      >
        Error creating reference. Try clicking "Create" again, or try reloading
        the page.
      </b-alert>
    </div>
  </div>
</template>

<script>
import utils from '../utils';

export default {
  props: {
    alertNotFound: {
      type: Boolean,
      default: true,
    },
    DOI: { type: String, required: true },

    alreadyFoundButtonText: {
      type: String,
      default: 'Insert',
    },
    connectionErrMsg: {
      type: String,
      default: 'Connection Error. Try clicking "Find DOI" again or reloading.',
    },
    foundInSplashMsg: {
      type: String,
      default: 'This reference is in the Splash database:',
    },
    foundInServiceMsg: {
      type: String,
      default: 'Here is the reference info:',
    },
  },
  data() {
    return {
      fields: [{ key: 'citation_html', label: 'Citation' }, { key: 'insert', label: '' }],
      items: [],
      createReferenceFlags: {
        alreadyExists: false,
        notFound: false,
        found: false,
        connectionError: false,
        creationError: false,
        loading: false,
      },
      citationHTML: '',
      referenceResponseObject: {},
      inTextCitation: '',
    };
  },
  mounted() {
    this.loader(this.getReferenceInfo, [this.DOI]);
  },
  watch: {
    DOI: {
      handler() {
        this.resetFlags();
        this.loader(this.getReferenceInfo, [this.DOI]);
      },
    },
  },
  methods: {
    resetFlags() {
      Object.keys(this.createReferenceFlags).forEach((v) => {
        this.createReferenceFlags[v] = false;
      });
    },
    async loader(func, args) {
      this.createReferenceFlags.loading = true;
      this.$emit('loading');
      await func(...args);
      this.createReferenceFlags.loading = false;
      this.$emit('not-loading');
    },
    async addNewReference(doi) {
      const referenceObject = this.referenceResponseObject.data;
      referenceObject.DOI = doi;
      referenceObject.origin_url = this.referenceResponseObject.request.responseURL;
      try {
        await utils.addRefObjectToSplash(referenceObject);
        this.createReferenceFlags.found = false;
        this.createReferenceFlags.alreadyExists = true;
        this.insertRefHandler(this.inTextCitation, doi, this.citationHTML);
      } catch (e) {
        console.log(e);
        this.createReferenceFlags.creationError = true;
      }
    },
    async getReferenceInfo(doi) {
      try {
        const result = await utils.checkDOIExists(doi);
        if (result === false) {
          this.createReferenceFlags.notFound = true;
          this.$emit('not-found');
          return;
        }
        this.inTextCitation = utils.generateInTextCitation(result.response.data);
        this.citationHTML = utils.generateHtmlCitation(result.response.data);
        if (result.where === 'service') {
          this.createReferenceFlags.found = true;
        } else {
          this.createReferenceFlags.alreadyExists = true;
        }
        this.referenceResponseObject = result.response;
      } catch (e) {
        this.createReferenceFlags.connectionError = true;
      }
    },
    insertRefHandler(inTextCitation, doi, html) {
      this.$emit('insert-ref', inTextCitation, doi, html);
    },
  },
};
</script>
