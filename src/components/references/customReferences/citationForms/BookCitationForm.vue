<template>
  <b-container>
    <b-form @submit="onSubmit">
      <author-input @input="citation.author = $event" :disabled="disabled" />
      <h6 class="m-1">Book Title</h6>
      <b-form-group>
        <b-form-input
          v-model="citation.title"
          :state="validTitle"
          :disabled="disabled"
        />
        <b-form-invalid-feedback :state="validTitle">
          This is required.
        </b-form-invalid-feedback>
      </b-form-group>
      <h6 class="m-1">Periodical Title</h6>
      <b-form-group>
        <b-form-input
          v-model="citation['container-title']"
          :state="validContainerTitle"
          :disabled="disabled"
        />
        <b-form-invalid-feedback :state="validContainerTitle">
          This is required.
        </b-form-invalid-feedback>
      </b-form-group>
      <b-row>
        <b-col>
          <h6 class="m-1">Year of Publication</h6>
          <b-form v-model="citation.issued.raw"/>
        </b-col>
        <b-col>
          <h6 class="m-1">DOI</h6>
          <doi-input @input="citation.DOI = $event" :disabled="disabled" />
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <h6 class="m-1">Volume</h6>
          <b-form-input
            :state="validVolume"
            v-model="citation.volume"
            :disabled="disabled"
          />
          <b-form-invalid-feedback :state="validVolume">
            Must be a number.
          </b-form-invalid-feedback>
        </b-col>
        <b-col>
          <h6 class="m-1">Issue</h6>
          <b-form-input
            :state="validIssue"
            v-model="citation.issue"
            :disabled="disabled"
          />
          <b-form-invalid-feedback :state="validIssue">
            Must be a number.
          </b-form-invalid-feedback>
        </b-col>
        <b-col>
          <h6 class="m-1">Pages</h6>
          <b-form-input
            v-model="citation.page"
            :state="validPageRange"
            placeholder="(e.g. 5-7, 9)"
            :disabled="disabled"
          />
          <b-form-invalid-feedback :state="validPageRange">
            Invalid page range.
          </b-form-invalid-feedback>
        </b-col>
      </b-row>
      <h6 class="m-1">URL</h6>
      <b-form-input v-model="citation.URL" :disabled="disabled" />
      <b-row>
        <b-col>
          <b-button
            class="mt-3"
            type="submit"
            variant="primary"
            :disabled="!citationValid || disabled"
            >Load citation</b-button
          >
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>
<script>
import DoiInput from '@/components/references/shared/DoiInput.vue';
import utils from '@/utils';
import AuthorInput from '../../shared/AuthorInput.vue';

export default {
  components: {
    DoiInput,
    AuthorInput,

  },

  computed: {
    citationValid() {
      if (this.validTitle === false) return false;
      if (this.validContainerTitle === false) return false;
      if (this.validYear === false) return false;
      if (this.validPageRange === false) return false;
      if (this.validVolume === false) return false;
      if (this.validIssue === false) return false;
      if (this.validAuthorList === false) return false;
      if (this.validDoi === false) return false;
      return true;
    },
    validTitle() {
      // remove all whitespace before testing if it is empty
      if (this.citation.title.replace(/\s+/g, '') === '') return false;
      return null;
    },
    validContainerTitle() {
      // remove all whitespace before testing if it is empty
      if (this.citation['container-title'].replace(/\s+/g, '') === '') return false;
      return null;
    },
    validPageRange() {
      // This regex for validating page ranges was taken from here: https://stackoverflow.com/a/4468356
      const regex = /^(\s*\d+\s*(-\s*\d+\s*)?)(,\s*\d+\s*(-\s*\d+\s*)?)*$/g;
      if (this.citation.page === '' || regex.test(this.citation.page)) return null;
      return false;
    },
    validVolume() {
      if (this.citation.volume === '') return null;
      const onlyDigits = /^\d+$/;
      if (onlyDigits.test(this.citation.volume) === true) return null;
      return false;
    },
    validIssue() {
      if (this.citation.issue === '') return null;
      const onlyDigits = /^\d+$/;
      if (onlyDigits.test(this.citation.issue) === true) return null;
      return false;
    },
    validYear() {
      if (!utils.isOnlyDigits(this.citation.issued.raw)) return false;
      const currentYear = new Date().getFullYear();

      // Sometimes publishers might push the date forward a year,
      // https://rhollick.wordpress.com/2012/04/08/copyright-date/
      const acceptablePublishingYear = currentYear + 1;

      if (Number.isSafeInteger(parseInt(this.citation.raw, 10)) <= acceptablePublishingYear) {
        return true;
      }
      return false;
    },
    validAuthorList() {
      if (this.citation.author === null) return false;
      return null;
    },
    validDoi() {
      if (this.citation.DOI === null) return false;
      return true;
    },
  },
  data() {
    return {
      citation: {
        type: 'book',
        DOI: undefined,
        title: '',
        issued: {
          raw: undefined,
        },
        author: null,
        volume: undefined,
        edition: undefined,
        'container-title': undefined,
        page: '',
      },
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onSubmit(event) {
      event.preventDefault();
      this.$emit('createRef', JSON.parse(JSON.stringify(this.citation)));
    },

  },
};
</script>
