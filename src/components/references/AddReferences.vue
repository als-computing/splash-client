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

    </div>
  </div>
</template>

<script>
import { BIconPlus } from 'bootstrap-vue';
import MongoSearch from '@/components/MongoSearch.vue';
import referenceUtils from './referenceUtils';

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
        this.createReferenceFlags.creationError = true;
      }
    },
    async getReferenceInfo(doi) {
      let response = {};
      try {
        response = await this.getSplashReference(doi);
        this.inTextCitation = referenceUtils.generateInTextCitation(response.data);
        this.citationHTML = referenceUtils.generateHtmlCitation(response.data);
        this.createReferenceFlags.alreadyExists = true;
        return;
      } catch (e) {
        if (!e.response || e.response.status !== 404) {
          this.createReferenceFlags.connectionError = true;
          return;
        }
      }
      try {
        response = await this.getDOIFromService(doi);
        this.inTextCitation = referenceUtils.generateInTextCitation(response.data);
        this.citationHTML = referenceUtils.generateHtmlCitation(response.data);
        this.referenceResponseObject = response;
        this.createReferenceFlags.found = true;
      } catch (e) {
        if (!e.response || e.response.status !== 404) {
          this.createReferenceFlags.connectionError = true;
        } else {
          this.createReferenceFlags.notFound = true;
        }
      }
    },
    updateItems(references) {
      this.items = references.map((elem) => ({
        inTextCitation: referenceUtils.generateInTextCitation(elem),
        citation_html: referenceUtils.generateHtmlCitation(elem),
        DOI: elem.DOI,
      }));
    },
    plusClickHandler(inTextCitation, doi, html) {
      this.$emit('clickedRef', inTextCitation, doi, html);
    },
  },
  components: {
    BIconPlus,
    MongoSearch,
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
