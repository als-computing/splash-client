<template>
  <div>
    <b-modal
      v-model="couldNotPerformAction"
      v-b-modal.modal-center
      ok-only
      :static="true"
      >We couldn't perform that action. Check your internet connection and try again. If the
      problem persists, contact the administrator.</b-modal
    >
    <b-overlay :show="refsLoading" rounded="sm">
      <b-table striped hover :items="items" :fields="table_fields">
        <template #cell(index)="data"> {{ data.index + 1 }}. </template>
        <template #cell(citation)="data">
          <div align="left">
            <div v-if="items[data.index].error">{{ data.value }}</div>
            <div v-else v-html="data.value"></div>
          </div>
        </template>
         <template #cell(delete)="data"> <b-icon-x class="pointer" v-show="!readOnly" @click="removeReference(data.index)"/> </template>
      </b-table>
    </b-overlay>
    <b-button v-show="!readOnly" @mousedown="insert_reference = true;"
      >Add Additional Reference</b-button
    >
    <b-modal v-model="insert_reference" ok-only>
      <add-references
        @clickedRef="addReference(arguments[0], arguments[1], arguments[2])"
      />
    </b-modal>
  </div>
</template>
<script>
import AddReferences from '@/components/editor/AddReferences.vue';
import utils from '@/components/editor/utils';
import { BIconX } from 'bootstrap-vue';

export default {
  props: { referencesArray: Array, readOnly: { type: Boolean, default: false } },
  components: {
    AddReferences,
    BIconX,
  },
  data() {
    return {
      couldNotPerformAction: false,
      references: [],
      items: [],
      refsLoading: false,
      table_fields: [{ key: 'index', label: '' }, { key: 'citation', label: 'Additional References' }, { key: 'delete', label: '' }],
      insert_reference: false,
    };
  },
  mounted() {
    // clone the array of objects along with their primitives
    // into an internal data property we can mess around with
    // note that this does not clone nested objects
    // https://stackoverflow.com/questions/597588/how-do-you-clone-an-array-of-objects-in-javascript/
    this.references = this.referencesArray.map((a) => ({ ...a }));
    this.getReferenceCitations();
  },
  methods: {
    async emitToParent(data) {
      // This emits an object with the altered data, and
      // a callback for the parent component to call with a boolean as the argument,
      // so that this component can know whether not the data was saved succesfully
      // if the data was succesfully saved then the code will execute as normal.
      // if not then this function will throw an error
      // Partly inspired by how this programmer awaits a settimeout https://stackoverflow.com/a/51939030/8903570
      return new Promise((resolve, reject) => this.$emit('dataToParent', {
        data,
        callback: (success) => {
          if (success) {
            resolve();
          } else {
            reject();
          }
        },
      }));
    },
    async removeReference(index) {
      this.$emit('toggle-editing', true);
      this.refsLoading = true;
      const removedItem = this.references[index];
      this.references.splice(index, 1);
      try {
        await this.emitToParent(this.references);
        this.items.splice(index, 1);
        this.refsLoading = false;
      } catch (e) {
        this.references.splice(index, 0, removedItem);
        this.refsLoading = false;
        this.couldNotPerformAction = true;
      }
      this.$emit('toggle-editing', false);
    },
    async addReference(inTextCitation, doi, html) {
      this.$emit('toggle-editing', true);
      this.insert_reference = false;
      this.refsLoading = true;
      this.references.push({ doi, in_text: false });
      try {
        await this.emitToParent(this.references);
        this.items.push({ doi, citation: html, error: false });
        this.refsLoading = false;
      } catch (e) {
        this.references.pop();
        this.refsLoading = false;
        this.couldNotPerformAction = true;
      }
      this.$emit('toggle-editing', false);
    },
    async getReferenceCitations() {
      this.refsLoading = true;
      const items = await Promise.all(
        this.references.map(async (refElem) => {
          const reference = this.items.find((item) => item.doi === refElem.doi);
          if (reference !== undefined && reference.error === false) {
            return reference;
          }
          return utils.getRefOrCreateIfNotExists(refElem.doi);
        }),
      );
      this.refsLoading = false;
      this.items = items;
    },
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>