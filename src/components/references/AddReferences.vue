<template>
  <div class="documentation_editor">
    <div align="left">
      <b-card title="Search Splash For References">
        <mongo-search
          query-key="search"
          :query-endpoint="$references_url"
          placeholder="Search References"
          @updatedResults="updateItems(arguments[0])"
        />
        <b-table
          :hover="true"
          small
          :items="items"
          :fields="fields"
          responsive="sm"
        >
          <template #cell(citation_html)="data">
            <span v-html="data.value"></span>
          </template>
          <template #cell(insert)="data">
            <b-icon-plus
              class="pointer"
              @click="
                plusClickHandler(
                  items[data.index].inTextCitation,
                  items[data.index].DOI,
                  items[data.index].citation_html
                )
              "
            />
          </template>
        </b-table>
      </b-card>
      <b-card title="Create a Reference" class="mt-4">
        <doi-input
          @input="
            referenceDoiToCreate = $event;
            resetFlags();
          "
          :disabled="createReferenceFlags.loading"
        >
          <template v-slot:button>
            <b-button
              class="search-button"
              size="sm"
              text="Button"
              :disabled="
                referenceDoiToCreate === null ||
                referenceDoiToCreate === '' ||
                createReferenceFlags.loading
              "
              @click="
                resetFlags();
                loader(getReferenceInfo, [referenceDoiToCreate]);
              "
              >Find DOI</b-button
            >
          </template>
        </doi-input>
        <b-alert
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
          Connection Error. Try clicking "Find DOI" again or reloading.
        </b-alert>
        <div v-if="createReferenceFlags.alreadyExists">
          <h5>This reference is in the Splash database:</h5>
          <span v-html="citationHTML"></span>
          <b-button
            @click="
              plusClickHandler(
                inTextCitation,
                referenceDoiToCreate,
                citationHTML
              )
            "
            >{{ alreadyFoundButtonText }}</b-button
          >
        </div>
        <div v-if="createReferenceFlags.found">
          <h5>Here is the reference info:</h5>
          <span v-html="citationHTML"></span>
          <b-button
            @click="
              createReferenceFlags.creationError = false;
              loader(addNewReference, [referenceDoiToCreate]);
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
            Error creating reference. Try clicking "Create" again, or try
            reloading the page.
          </b-alert>
        </div>
      </b-card>
    </div>
  </div>
</template>

<script>
import { BIconPlus } from 'bootstrap-vue';
import MongoSearch from '@/components/MongoSearch.vue';
import DoiInput from '@/components/references/shared/DoiInput.vue';
import utils from './utils';

export default {
  props: {
    alreadyFoundButtonText: {
      type: String,
      default: 'Insert',
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
      referenceDoiToCreate: '',
      citationHTML: '',
      referenceResponseObject: {},
      inTextCitation: '',
    };
  },
  methods: {
    async getDOIFromService(doi) {
      const response = await this.$doi_service.get(`/${doi}`);
      return response;
    },
    async getSplashReference(doi) {
      const response = await this.$api.get(`${this.$references_url}/doi/${doi}`);
      return response;
    },
    async createReference(reference) {
      const response = await this.$api.post(`${this.$references_url}`, reference);
      return response;
    },
    resetFlags() {
      Object.keys(this.createReferenceFlags).forEach((v) => {
        this.createReferenceFlags[v] = false;
      });
    },
    async loader(func, args) {
      this.createReferenceFlags.loading = true;
      await func(...args);
      this.createReferenceFlags.loading = false;
    },
    async addNewReference(doi) {
      const referenceObject = this.referenceResponseObject.data;
      referenceObject.DOI = doi;
      referenceObject.origin_url = this.referenceResponseObject.request.responseURL;
      try {
        await this.createReference(referenceObject);
        this.createReferenceFlags.found = false;
        this.createReferenceFlags.alreadyExists = true;
        this.plusClickHandler(this.inTextCitation, doi, this.citationHTML);
      } catch (e) {
        console.log(e);
        this.createReferenceFlags.creationError = true;
      }
    },
    async getReferenceInfo(doi) {
      let response = {};
      try {
        response = await this.getSplashReference(doi);
        this.inTextCitation = utils.generateInTextCitation(response.data);
        this.citationHTML = utils.generateHtmlCitation(response.data);
        this.createReferenceFlags.alreadyExists = true;
        return;
      } catch (e) {
        console.log(e);
        if (!e.response || e.response.status !== 404) {
          this.createReferenceFlags.connectionError = true;
          return;
        }
      }
      try {
        response = await this.getDOIFromService(doi);
        this.inTextCitation = utils.generateInTextCitation(response.data);
        this.citationHTML = utils.generateHtmlCitation(response.data);
        this.referenceResponseObject = response;
        this.createReferenceFlags.found = true;
      } catch (e) {
        console.log(e);
        if (!e.response || e.response.status !== 404) {
          this.createReferenceFlags.connectionError = true;
        } else {
          this.createReferenceFlags.notFound = true;
        }
      }
    },
    updateItems(references) {
      this.items = references.map((elem) => {
        return {
          inTextCitation: utils.generateInTextCitation(elem),
          citation_html: utils.generateHtmlCitation(elem),
          DOI: elem.DOI,
        };
      });
    },
    plusClickHandler(inTextCitation, doi, html) {
      this.$emit('clickedRef', inTextCitation, doi, html);
    },
  },
  components: {
    BIconPlus,
    MongoSearch,
    DoiInput,
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
.text-red {
  color: red;
}

.active {
  background-color: yellowgreen;
}
</style>
