<template>
  <b-container>
    <b-form @submit="onSubmit">
      <author-input @input="citation.author = $event" :disabled="disabled" />
      <h6 class="m-1">Title</h6>
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
      <h6 class="m-1">Date of Publication</h6>
      <text-date-picker
        @input="citation.issued.raw = $event"
        :disabled="disabled"
      />
      <h6 class="m-1">Website Name</h6>
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
      <h6 class="m-1">URL</h6>
      <b-form-input v-model="citation.URL" :disabled="disabled" :state="validURL" />
      <b-form-invalid-feedback :state="validURL">
          This is required.
        </b-form-invalid-feedback>
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
import TextDatePicker from '@/components/utils/TextDatePicker.vue';
import AuthorInput from '../../shared/AuthorInput.vue';

export default {
  components: {
    TextDatePicker,
    AuthorInput,

  },

  computed: {
    citationValid() {
      if (this.validTitle === false) return false;
      if (this.validContainerTitle === false) return false;
      if (this.validDate === false) return false;
      if (this.validPageRange === false) return false;
      if (this.validVolume === false) return false;
      if (this.validIssue === false) return false;
      if (this.validAuthorList === false) return false;
      if (this.validDoi === false) return false;
      if (this.validURL === false) return false;
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
    validDate() {
      if (this.citation.issued.raw === undefined || this.citation.issued.raw === null) return false;
      return null;
    },
    validAuthorList() {
      if (this.citation.author === null) return false;
      return null;
    },
    validURL() {
      if (this.citation.URL === '') return false;
      return null;
    },
  },
  data() {
    return {
      citation: {
        type: 'webpage',
        title: '',
        issued: {
          raw: undefined,
        },
        'container-title': '',
        author: null,
        URL: '',
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
