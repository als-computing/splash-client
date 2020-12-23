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
          <template #cell(citation)="data">
            <span v-html="data.value"></span>
          </template>
          <template #cell(insert)="data">
            <b-icon-plus
              class="pointer"
              @click="plusClickHandler(items[data.index].DOI)"
            />
          </template>
        </b-table>
      </b-card>
      <b-card title="Create a Reference" class="mt-4">
        <b-input-group>
          <b-form-input
            placeholder="Copy paste a DOI in here..."
            v-model.trim="referenceDoiToCreate"
            class="form-control search-bar"
            type="text"
            @input="resetFlags()"
            :disabled="createReferenceFlags.loading"
          />
          <b-input-group-append>
            <b-button
              class="search-button"
              size="sm"
              text="Button"
              :disabled="
                !isDoiFormat(referenceDoiToCreate) ||
                createReferenceFlags.loading
              "
              @click="
                resetFlags();
                loader(getReferenceInfo, [referenceDoiToCreate])
              "
              >Create New</b-button
            >
          </b-input-group-append>
        </b-input-group>
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
          Connection Error. Try clicking "Create New" again or reloading.
        </b-alert>
        <div v-if="createReferenceFlags.alreadyExists">
          <h5>This reference already exists:</h5>
          <span v-html="citationHTML"></span>
          <b-button @click="plusClickHandler(referenceDoiToCreate)"
            >Insert</b-button
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
            >Create</b-button
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
        <b-spinner v-show="createReferenceFlags.loading"/>
      </b-card>
    </div>
  </div>
</template>

<script>
import Citation from 'citation-js';
import { BIconPlus } from 'bootstrap-vue';
import MongoSearch from '@/components/MongoSearch.vue';

const CITE_FORMAT = { format: 'html', template: 'apa', lang: 'en-US' };
export default {
  data() {
    return {
      fields: ['citation', { key: 'insert', label: '' }],
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
    };
  },
  async mounted() {},
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
    isDoiFormat(string) {
      if (string.startsWith('10.') && string.includes('/')) {
        return true;
      }
      return false;
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
        this.plusClickHandler(doi);
      } catch (e) {
        console.log(e);
        this.createReferenceFlags.creationError = true;
      }
    },
    async getReferenceInfo(doi) {
      let response = {};
      try {
        response = await this.getSplashReference(doi);
        this.citationHTML = new Citation(response.data).format('bibliography', CITE_FORMAT);
        this.createReferenceFlags.alreadyExists = true;
        return;
      } catch (e) {
        console.log(e);
        if (e.response.status !== 404) {
          this.createReferenceFlags.connectionError = true;
          return;
        }
      }
      try {
        response = await this.getDOIFromService(doi);
        this.citationHTML = new Citation(response.data).format('bibliography', CITE_FORMAT);
        this.referenceResponseObject = response;
        this.createReferenceFlags.found = true;
      } catch (e) {
        console.log(e);
        if (e.response.status !== 404) {
          this.createReferenceFlags.connectionError = true;
        } else {
          this.createReferenceFlags.notFound = true;
        }
      }
    },
    updateItems(references) {
      this.items = references.map((elem) => ({
        citation: new Citation(elem).format('bibliography', CITE_FORMAT),
        DOI: elem.DOI,
      }));
    },
    plusClickHandler(doi) {
      this.$emit('clickedRef', doi);
    },
  },
  components: {
    'b-icon-plus': BIconPlus,
    'mongo-search': MongoSearch,
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
