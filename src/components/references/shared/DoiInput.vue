<template>
  <div>
    <b-input-group>
      <b-form-input
        placeholder="10.XXX/XXXXX"
        v-model.trim="doiInput"
        class="form-control search-bar"
        type="text"
        :disabled="disabled"
        :state="doiValid"
      />
      <b-input-group-append>
        <slot name="button"></slot>
      </b-input-group-append>
    </b-input-group>
    <b-form-invalid-feedback :state="doiValid">
      The DOI must be this format: 10.XXX/XXXXX
    </b-form-invalid-feedback>
  </div>
</template>

<script>
import { isDoiFormat } from '@/utils';

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    doiValid() {
      if (this.doiInput === '') return null;
      return this.isDoiFormat(this.doiInput);
    },
  },
  watch: {
    doiInput: {
      handler() {
        if (this.isDoiFormat(this.doiInput)) {
          this.$emit('input', this.doiInput);
          return;
        }
        if (this.doiInput === '') {
          this.$emit('input', undefined);
          return;
        }
        this.$emit('input', null);
      },
      immediate: true,
    },
  },

  data() {
    return {
      doiInput: '',
    };
  },
  methods: {
    isDoiFormat,
  },
};
</script>
