<template>
  <b-sidebar
    :id="id"
    :title="title"
    :width="width"
    :visible="value"
    @change="$emit('input', arguments[0])"
    :backdrop="backdrop"
    lazy
    right
    shadow
  >
    <add-references
      @clickedRef="emitReference(arguments[0], arguments[1], arguments[2])"
    />
    <create-custom-reference
      @add-ref="emitReference(arguments[0], arguments[1], arguments[2])"
      :justCreatedButtonText="justCreatedButtonText"
    />
  </b-sidebar>
</template>

<script>
import CreateCustomReference from '../customReferences/CreateCustomReference.vue';
import AddReferences from '../AddReferences.vue';

export default {
  props: {
    justCreatedButtonText: {
      type: String,
      default: 'Insert',
    },
    value: Boolean,
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      required: true,
    },
    backdrop: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    AddReferences,
    CreateCustomReference,
  },
  methods: {
    emitReference(text, uid, citationHtml) {
      this.$emit('selected-ref', text, uid, citationHtml);
    },
  },
};
</script>
