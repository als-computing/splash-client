<template>
  <b-card>
    <h6>{{ title }}</h6>
    <div v-for="(contributor, index) in contributors" :key="index">
      <b-input-group class="mb-2">
        <b-input
          placeholder="Last name"
          @input="contributors[index].family = arguments[0]"
          :disabled="disabled"
        />
        <b-input
          placeholder="First name"
          @input="contributors[index].given = arguments[0]"
          :disabled="disabled"
        />
        <b-button
          v-if="index === 0"
          @click="addContributor"
          variant="link"
          pill
          size="sm"
          :disabled="disabled"
        >
          <b-icon-plus-circle-fill />
        </b-button>
        <b-button
          v-if="index !== 0"
          @click="removeContributor(index)"
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

  props: {
    title: {
      type: String,
      default: 'Authors',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // maxId: 0,
      contributors: [{ given: '', family: '' }],
    };
  },
  computed: {
    validNames() {
      return this.contributors.map((elem) => {
        if (elem.family.replace(/\s+/g, '') === '' || elem.given.replace(/\s+/g, '') === '') return false;
        return true;
      });
    },
    isContributorListValid() {
      return this.validNames.every((value) => value === true);
    },
  },
  components: {
    BIconPlusCircleFill,
    BIconX,
  },
  methods: {
    // Usually we need to create ids for each new contributor we make so we can have a unique key
    // ( https://vuejs.org/v2/guide/list.html#v-for-with-a-Component) attached to
    // each input in the v-for. But in this case, I think it's OK,
    //  given that we are only appending and deleting elements.
    /* getNewId() {
      this.maxId += 1;
      return this.maxId;
    }, */
    addContributor() {
      this.contributors.push({ given: '', family: '' /* id: this.getNewId() */ });
    },
    removeContributor(index) {
      this.contributors.splice(index, 1);
    },
  },
  watch: {
    contributors: {
      handler() {
        if (this.isContributorListValid === true) {
          this.$emit('input', this.contributors);
        } else {
          this.$emit('input', null);
        }
      },
      immediate: true,
      deep: true,
    },
  },
};
</script>
