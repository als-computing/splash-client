<template>
  <b-card>
    <h6>Authors</h6>
    <div v-for="(author, index) in authors" :key="index">
      <b-input-group class="mb-2">
        <b-input
          placeholder="Last name"
          @input="authors[index].family = arguments[0]"
          :disabled="disabled"
        />
        <b-input
          placeholder="First name"
          @input="authors[index].given = arguments[0]"
          :disabled="disabled"
        />
        <b-button
          v-if="index === 0"
          @click="addAuthor"
          variant="link"
          pill
          size="sm"
          :disabled="disabled"
        >
          <b-icon-plus-circle-fill />
        </b-button>
        <b-button
          v-if="index !== 0"
          @click="removeAuthor(index)"
          variant="link"
          pill
          size="sm"
          :disabled="disabled"
        >
          <b-icon-x />
        </b-button>
      </b-input-group>
      <b-form-invalid-feedback :state="validNames[index]">
        Last name and first name required
      </b-form-invalid-feedback>
    </div>
  </b-card>
</template>

<script>
import { BIconPlusCircleFill, BIconX } from 'bootstrap-vue';

export default {
  computed: {
    validNames() {
      return this.authors.map((elem) => {
        if (elem.family.replace(/\s+/g, '') === '' || elem.given.replace(/\s+/g, '') === '') return false;
        return true;
      });
    },
    isAuthorListValid() {
      return this.validNames.every((value) => value === true);
    },
  },
  components: {
    BIconPlusCircleFill,
    BIconX,
  },
  methods: {
    // Usually we need to create ids for each new author we make so we can have a unique key
    // ( https://vuejs.org/v2/guide/list.html#v-for-with-a-Component) attached to
    // each input in the v-for. But in this case, I think it's OK,
    //  given that we are only appending and deleting elements.
    /* getNewId() {
      this.maxId += 1;
      return this.maxId;
    }, */
    addAuthor() {
      this.authors.push({ given: '', family: '' /* id: this.getNewId() */ });
    },
    removeAuthor(index) {
      this.authors.splice(index, 1);
    },
  },
  watch: {
    authors: {
      handler() {
        if (this.isAuthorListValid === true) {
          this.$emit('input', this.authors);
        } else {
          this.$emit('input', null);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // maxId: 0,
      authors: [{ given: '', family: '' }],
    };
  },
};
</script>
