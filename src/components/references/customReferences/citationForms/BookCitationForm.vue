<template>
  <b-container>
    <b-form @submit="onSubmit" @reset="$emit('reset')">
      <contributor-input @input="citation.author = $event" :disabled="disabled" />
      <b-form-checkbox
        v-model="includeEditor"
        :value="true"
        :unchecked-value="false"
        @change="handleIncludeEditorChange"
        :disabled="disabled"
      >
        Add editors
      </b-form-checkbox>
      <contributor-input title="Editors" @input="citation.editor = $event" :disabled="disabled" v-if="includeEditor" />
      <h6 class="m-1">Book Title</h6>
      <b-form-group>
        <b-form-input
          v-model="citation[bookTitleKey]"
          :state="validBookTitle"
          :disabled="disabled"
        />
        <b-form-invalid-feedback :state="validBookTitle">
          This is required.
        </b-form-invalid-feedback>
      </b-form-group>
      <b-row>
        <b-col>
          <h6 class="m-1">Year of Publication</h6>
          <b-input v-model="citation.issued.raw" :state="validYear" :disabled="disabled" />
          <b-form-invalid-feedback :state="validYear">
            {{yearErrorMessage}}
          </b-form-invalid-feedback>
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
          <h6 class="m-1">Edition</h6>
          <b-form-input
            :state="validEdition"
            v-model="citation.edition"
            :disabled="disabled"
          />
          <b-form-invalid-feedback :state="validEdition">
            Must be a number.
          </b-form-invalid-feedback>
        </b-col>
      </b-row>
      <b-form-checkbox
        v-model="citation.type"
        value="chapter"
        unchecked-value="book"
        @change="handleTypeChange"
        :disabled="disabled"
      >
        Cite chapter
      </b-form-checkbox>
      <b-row v-if="citation.type === 'chapter'">
        <b-col sm="8">
          <h6 class="m-1">Chapter Title</h6>
          <b-form-group>
            <b-form-input
              v-model="citation.title"
              :state="validChapterTitle"
              :disabled="disabled"
            />
            <b-form-invalid-feedback :state="validChapterTitle">
              This is required.
            </b-form-invalid-feedback>
          </b-form-group>
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
      <b-row>
        <b-col>
          <b-button
            class="mt-3"
            type="submit"
            variant="primary"
            :disabled="!citationValid || disabled"
            >Load citation</b-button
          >
          <b-button
            class="mt-3"
            type="reset"
            variant="danger"
            :disabled="disabled"
            >Reset</b-button
          >
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>
<script>
import DoiInput from '@/components/references/shared/DoiInput.vue';
import utils from '@/utils';
import ContributorInput from '../../shared/ContributorInput.vue';

export default {
  components: {
    DoiInput,
    ContributorInput,

  },

  computed: {
    citationValid() {
      if (this.validBookTitle === false) return false;
      if (this.validChapterTitle === false) return false;
      if (this.validYear === false) return false;
      if (this.validPageRange === false) return false;
      if (this.validVolume === false) return false;
      if (this.validEdition === false) return false;
      if (this.validAuthorList === false) return false;
      if (this.validEditorList === false) return false;
      if (this.validDoi === false) return false;
      return true;
    },
    validBookTitle() {
      if (this.citation.type === 'book') return this.ensureStrHasStuff(this.citation.title);
      return this.ensureStrHasStuff(this.citation['container-title']);
    },
    validChapterTitle() {
      if (this.citation.type === 'book') return null;
      return this.ensureStrHasStuff(this.citation.title);
    },
    validPageRange() {
      if (this.citation.page === '' || utils.validPageRange(this.citation.page)) return null;
      return false;
    },
    validVolume() {
      return this.emptyOrIsNumber(this.citation.volume);
    },
    validEdition() {
      return this.emptyOrIsNumber(this.citation.edition);
    },
    validAuthorList() {
      if (this.citation.author === null) return false;
      return null;
    },
    validEditorList() {
      if (this.citation.editor === undefined && this.includeEditor === false) return null;
      if (this.citation.editor === null) return false;
      return null;
    },
    validDoi() {
      if (this.citation.DOI === null) return false;
      return true;
    },
  },

  watch: {
    'citation.issued.raw': {
      immediate: true,
      handler() {
        const year = this.citation.issued.raw;
        if (!utils.isOnlyDigits(year) || !Number.isSafeInteger(parseInt(year, 10))) {
          this.yearErrorMessage = 'Must be a number.';
          this.validYear = false;
          return;
        }
        const currentYear = new Date().getFullYear();

        // Sometimes publishers might push the date forward a year,
        // https://rhollick.wordpress.com/2012/04/08/copyright-date/
        const acceptablePublishingYear = currentYear + 1;

        if (parseInt(year, 10) <= acceptablePublishingYear) {
          this.validYear = null;
        } else {
          this.yearErrorMessage = `Must be less than or equal to ${acceptablePublishingYear}.`;
          this.validYear = false;
        }
      },
    },
  },
  data() {
    return {
      yearErrorMessage: 'Must be a number.',
      validYear: false,
      includeEditor: false,
      bookTitleKey: 'title',
      citation: {
        type: 'book',
        DOI: undefined,
        title: '',
        issued: {
          raw: undefined,
        },
        author: null,
        editor: undefined,
        volume: '',
        edition: '',
        'container-title': '',
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
    handleIncludeEditorChange() {
      if (this.includeEditor === false) { this.citation.editor = undefined; return; }
      this.citation.editor = null;
    },
    handleTypeChange() {
      console.log('Hello');
      if (this.citation.type === 'chapter') {
        this.citation['container-title'] = this.citation.title;
        this.bookTitleKey = 'container-title';
        this.citation.title = '';
      }
      if (this.citation.type === 'book') {
        this.citation.title = this.citation['container-title'];
        this.bookTitleKey = 'title';
        this.citation['container-title'] = '';
        this.citation.page = '';
      }
    },
    emptyOrIsNumber(str) {
      if (str === '') return null;
      if (utils.isOnlyDigits(str) === true) return null;
      return false;
    },
    ensureStrHasStuff(str) {
      if (utils.isStrEmptyOrWhitespace(str)) return false;
      return null;
    },
    onSubmit(event) {
      event.preventDefault();
      this.$emit('createRef', JSON.parse(JSON.stringify(this.citation)));
    },

  },
};
</script>
