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
      <b-button @click="insertRefHandler(inTextCitation, DOI, citationHTML)">{{
        alreadyFoundButtonText
      }}</b-button>
      <b-button
        v-if="allowCustomReferenceWithExistingDoi"
        @click="$emit('use-custom-ref')"
        class="mx-1"
        >Load my custom reference</b-button
      >
      <b-button @click="$emit('cancel')" variant="warning"> Cancel </b-button>
    </div>
    <div v-if="createReferenceFlags.found">
      <h5>{{ foundInServiceMsg }}</h5>
      <span v-html="citationHTML"></span>
      <b-button
        @click="
          createReferenceFlags.creationError = false;
          loader(addNewReferenceWithDOI, [DOI]);
        "
        >Create New</b-button
      >
      <b-button
        v-if="allowCustomReferenceWithExistingDoi"
        @click="$emit('use-custom-ref')"
        class="mx-1"
        >Load my custom reference</b-button
      >
      <b-button @click="$emit('cancel')" variant="warning"> Cancel </b-button>
    </div>
    <div v-if="createReferenceFlags.customReference">
      <h5>Here is your reference. Does this look right?</h5>
      <span v-html="citationHTML"></span>
      <b-button
        @click="
          createReferenceFlags.creationError = false;
          loader(addNewCustomReference, []);
        "
        >Create New</b-button
      >
      <b-button @click="$emit('cancel')" variant="warning"> Cancel </b-button>
    </div>
    <b-alert
      v-model="createReferenceFlags.creationError"
      dismissible
      align="center"
      fade
      variant="warning"
    >
      Error creating reference. Try clicking "Create New" again, or try
      reloading the page.
    </b-alert>
  </div>
</template>

<script>
import referenceUtils from '../referenceUtils';

export default {
  props: {
    allowCustomReferenceWithExistingDoi: {
      type: Boolean,
      default: false,
    },
    customReference: Object,
    DOI: String,
    alertNotFound: {
      type: Boolean,
      default: true,
    },
    alreadyFoundButtonText: {
      type: String,
      default: 'Insert',
    },
    connectionErrMsg: {
      type: String,
      default: 'Connection Error. Try again or try reloading the page.',
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
        customReference: false,
      },
      citationHTML: '',
      referenceResponseObject: {},
      inTextCitation: '',
    };
  },
  mounted() {
    if (this.customReference !== undefined) {
      this.displayCustomReference();
      return;
    }
    this.loader(this.getReferenceInfo, [this.DOI]);
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

    async addNewCustomReference() {
      try {
        const { uid } = (await referenceUtils.addRefObjectToSplash(this.customReference)).splash_md;
        this.createReferenceFlags.customReference = false;
        this.createReferenceFlags.alreadyExists = true;
        this.insertRefHandler(this.inTextCitation, uid, this.citationHTML);
      } catch (e) {
        this.createReferenceFlags.creationError = true;
      }
    },

    displayCustomReference() {
      this.inTextCitation = referenceUtils.generateInTextCitation(this.customReference);
      this.citationHTML = referenceUtils.generateHtmlCitation(this.customReference);
      this.createReferenceFlags.customReference = true;
    },
    async addNewReferenceWithDOI(doi) {
      const referenceObject = this.referenceResponseObject.data;
      referenceObject.DOI = doi;
      referenceObject.origin_url = this.referenceResponseObject.request.responseURL;
      try {
        await referenceUtils.addRefObjectToSplash(referenceObject);
        this.createReferenceFlags.found = false;
        this.createReferenceFlags.alreadyExists = true;
        this.insertRefHandler(this.inTextCitation, doi, this.citationHTML);
      } catch (e) {
        this.createReferenceFlags.creationError = true;
      }
    },
    async getReferenceInfo(doi) {
      try {
        const result = await referenceUtils.checkDOIExists(doi);
        if (result === false) {
          this.createReferenceFlags.notFound = true;
          this.$emit('not-found');
          return;
        }
        this.inTextCitation = referenceUtils.generateInTextCitation(result.response.data);
        this.citationHTML = referenceUtils.generateHtmlCitation(result.response.data);
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
    insertRefHandler(inTextCitation, uid, html) {
      this.$emit('insert-ref', inTextCitation, uid, html);
    },
  },
};
</script>
