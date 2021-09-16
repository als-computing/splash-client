<template>
  <div>
    <div @dblclick="!readOnly ? edit() : {}">
      <b-container>
        <b-row v-show="editing === false" align-v="center" align-h="center">
          <b-col md="auto">
            <h1>{{ title }}</h1>
          </b-col>
          <b-col md="auto">
            <p>
              <span class="pointer" @click="edit()" v-if="readOnly !== true">
                <b-icon-pencil-square class = "mx-1"/>
              </span>
              <span
                class="text-muted"
                style="font-size: 0.8rem"
                v-if="readOnly !== true"
                >(or double click)</span
              >
            </p>
          </b-col>
        </b-row>
        <b-row v-show="editing === true" align-v="center" align-h="center" class="m-3">
          <b-col md="auto">
            <b-input-group
              ><b-form-input v-model="edited_title" :readonly="saving" />
              <b-button
                variant="primary"
                @click="emitEdit()"
                :disabled="
                  edited_title === '' || edited_title === title || saving
                "
                >Save</b-button
              >
              <b-button
                variant="warning"
                @click="removeFocus()"
                :disabled="saving === true"
                >Cancel</b-button
              ></b-input-group
            >
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import { BIconPencilSquare } from 'bootstrap-vue';
import dataToParent from '@/components/utils/dataToParent';

export default {
  props: {
    readOnly: {
      type: Boolean,
      default: false,
    },
    title: String,
  },
  data() {
    return {
      saving: false,
      couldNotSave: false,
      editing: false,
      edited_title: '',
    };
  },
  components: {
    BIconPencilSquare,
  },
  methods: {
    edit() {
      if (this.saving) {
        return;
      }
      this.$emit('toggle-editing', true);
      this.edited_title = this.title;
      this.editing = true;
    },
    async removeFocus() {
      this.editing = false;
      this.edited_title = '';
      this.$emit('toggle-editing', false);
    },
    async emitEdit() {
      try {
        this.saving = true;
        await dataToParent({ thisObj: this, data: this.edited_title });
        this.removeFocus();
        this.saving = false;
        this.$emit('toggle-editing', false);
      } catch (error) {
        this.saving = false;
        this.couldNotSave = true;
      }
    },
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
.active {
  background-color: lightblue;
}
/*This is necessary so that the style will apply to v-html*/
.raw-html-active >>> div {
  background-color: lightblue;
}
</style>
