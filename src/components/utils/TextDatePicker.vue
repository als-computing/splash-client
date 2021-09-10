<!--Based off of: https://bootstrap-vue.org/docs/components/form-datepicker#button-only-mode-->
<template>
  <div class='text-left'>
    <b-form-group
      :state="valid"
      invalid-feedback="Invalid Date."
    >
      <b-input-group>
        <b-form-input
          id="example-input"
          v-model="value"
          type="text"
          placeholder="yyyy-mm-dd"
          autocomplete="off"
          :state="valid"
          @input="onInput();"
          :disabled="disabled"
        ></b-form-input>
        <b-input-group-append>
          <b-form-datepicker
            v-model="value"
            button-only
            right
            locale="en-US"
            aria-controls="example-input"
            @context="onContext"
            :disabled='disabled'
          ></b-form-datepicker>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import utils from '@/utils';

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      value: '',
      valid: false,
      selectedYMD: '',
    };
  },

  watch: {

  },
  methods: {
    onContext(ctx) {
      console.log('onContext');
      // ctx.selectedYMD will be an empty string until a valid date is entered
      this.selectedYMD = ctx.selectedYMD;
      // onInput will always be called before this onContext,
      // So after onContext is done we want to call onInput again.
      this.onInput();
    },

    onInput() {
      console.log('onInput');
      if (this.value === '') {
        this.valid = false;
        this.$emit('input', undefined);
        return;
      }
      if (!utils.isValidDate(this.value)) {
        this.valid = false;
        this.$emit('input', null);
        return;
      }
      if (this.selectedYMD === '') {
        this.valid = false;
        this.$emit('input', null);
      } else { this.valid = true; this.$emit('input', this.value); }
    },
  },
};
</script>
