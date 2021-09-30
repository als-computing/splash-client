<template>
     <b-modal
      v-bind:visible="value"
      @change="$emit('input', $event)"
      v-b-modal.modal-center
      :static="true"
      ok-only
      no-close-on-esc
      no-close-on-backdrop
      hide-header
      >
      <div class="d-block"><h3>{{mainMessage}}</h3></div>
      <template #modal-footer="{ok}">
        <b-button @click="$emit('ok-click', {closeModal: ok})">{{okButtonLabel}}</b-button>
      </template>
    </b-modal>
</template>

<script>
export default {
  props: {
    value: Boolean,
    okButtonLabel: {
      type: String,
      default: 'Ok',
    },
    mainMessage: String,
  },
};
</script>
