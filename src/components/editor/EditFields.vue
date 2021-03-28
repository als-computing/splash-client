<template>
  <div class="documentation_editor">
    <div align="left">
      <b-icon-plus-circle-fill
        v-show="readOnly !== true"
        :class="`${currently_edited_index === undefined ? 'pointer' : ''} mt-2`"
        @click="currently_edited_index === undefined ? addSection(0) : {}"
      />
    </div>
    <h4 v-if="sections.length == 0">
      {{ emptyMessage }}
    </h4>
    <div v-if="sections.length !== 0">
      <!--This part iterates over the sections and displays them-->
      <!--Using the index as part of the key is bad practice here, If were moving
                around forms, like b-input, with internal states we would want a unique key,
                also if we wanted to force a component to be re-mounted when the list changes
                then we would use a unique key. However, none of these components need to
                be re-mounted to properly react to data change as of now. If things get weird,
                like the DOM not being in sync with the data when the list updates then
                we will want to add a unique key. This will happen when adding components
                in here that need to be remounted when data changes. However adding a unique key
                (by means of a counter or random num generator)
                to every object will be complex, and isn't worth the effort yet
                https://vuejs.org/v2/api/#key
                https://forum.vuejs.org/t/v-for-with-simple-arrays-what-key-to-use/13692/8
                https://forum.vuejs.org/t/what-key-to-use-in-v-for-where-items-have-no-identity/60111/7
                  -->
      <div
        align="left"
        v-for="(section, index) in sections"
        :key="section[textKey] + section[titleKey] + index"
      >
        <b-card>
          <!--This displays each section of the documentation-->
          <div
            @dblclick="
              readOnly === false &&
              currently_edited_index === undefined &&
              saving !== true
                ? edit(index, section[textKey], section[titleKey])
                : {}
            "
          >
            <div v-show="index !== currently_edited_index">
              <p>
                <strong>{{ section[titleKey] }}</strong>
                <span
                  class="pointer"
                  @click="edit(index, section[textKey], section[titleKey])"
                  v-if="readOnly !== true"
                >
                  <b-icon-pencil-square class="mx-1" />
                </span>
                <span
                  class="text-muted"
                  style="font-size: 0.8rem"
                  v-if="readOnly !== true"
                  >(or double click)</span
                >
              </p>

              {{ section[textKey] }}
            </div>

            <!--This appears when we want to edit the documentation-->
            <div v-if="index === currently_edited_index">
              <span class="text-muted">{{ titleInputName }}:</span>
              <b-form-input
                v-model="edited_data[titleKey]"
                :readonly="saving"
              />
              <span class="text-muted">{{ valueInputName }}:</span>
              <b-form-textarea
                v-model="edited_data[textKey]"
                max-rows="100"
                :readonly="saving"
              />

              <b-button-toolbar>
                <!--The save button is disabled when the boxes are empty, are not changed, or if the app is in the process of saving-->
                <b-button
                  variant="primary"
                  @click="emitEdit(index, section)"
                  :disabled="
                    edited_data[textKey] === '' ||
                    edited_data[titleKey] === '' ||
                    (edited_data[titleKey] === section[titleKey] &&
                      edited_data[textKey] === section[textKey]) ||
                    saving
                  "
                  >Save</b-button
                >

                <!--The cancel button is disabled when the app is in the process of saving-->
                <b-button
                  variant="warning"
                  @click="
                    removeFocus();
                    deleteIfNew(index, section);
                  "
                  :disabled="saving === true"
                  >Cancel</b-button
                >

                <!--The Delete Section button is hidden when the section[titleKey]
                        or section[textKey] is empty (implying that this is a brand new section)
                        and when the app is in the process of saving-->
                <b-button
                  variant="danger"
                  @click="showDeleteConfirmation(index)"
                  v-show="
                    !(section[titleKey] === '' || section[textKey] === '') &&
                    !saving
                  "
                  >{{ removeButtonText }}</b-button
                >

                <b-spinner v-show="saving === true" />
              </b-button-toolbar>
            </div>
          </div>

          <!--Add section is disabled if a section is being edited.
                  It is only shown for sections that are not being edited-->

          <b-modal
            v-model="couldNotSave"
            v-b-modal.modal-center
            ok-only
            :static="true"
            >We couldn't save. Check your internet connection and try again. If
            the problem persists, contact the administrator.</b-modal
          >
        </b-card>
        <b-icon-plus-circle-fill
          v-show="currently_edited_index !== index && readOnly !== true"
          :class="`${
            currently_edited_index === undefined ? 'pointer' : ''
          } mt-2`"
          @click="
            currently_edited_index === undefined ? addSection(index + 1) : {}
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
import { BIconPlusCircleFill, BIconPencilSquare } from 'bootstrap-vue';
import utils from './utils';
const { dataToParent } = utils;

export default {
  components: {
    BIconPencilSquare,
    'b-icon-plus-circle-fill': BIconPlusCircleFill,
  },
  props: {
    sectionsArray: Array,
    readOnly: {
      type: Boolean,
      default: false,
    },
    titleKey: {
      type: String,
      default: 'title',
    },
    textKey: {
      type: String,
      default: 'text',
    },
    emptyMessage: {
      type: String,
      default: 'No documentation found. Be the first to add some.',
    },
    removeButtonText: {
      type: String,
      default: 'Remove section',
    },
    addButtonText: {
      type: String,
      default: 'Add section',
    },
    deleteConfirmationMessage: {
      type: String,
      default: "Are you sure you want to delete this section? This can't be undone.",
    },
    titleInputName: {
      type: String,
      default: 'Title',
    },
    valueInputName: {
      type: String,
      default: 'Documentation',
    },
  },
  data() {
    return {
      sections: [],
      currently_edited_index: undefined,
      edited_data: {
        [this.titleKey]: '',
        [this.textKey]: '',
      },
      saving: false,
      refsLoading: false,
      couldNotSave: false,
      insert_reference: false,
      focused: false,
      curr_mode: 'wysiwyg',
    };
  },
  mounted() {
    // clone the array of objects along with their primitives
    // into an internal data property we can mess around with
    // note that this does not clone nested objects
    // https://stackoverflow.com/a/40283265/8903570
    this.sections = this.sectionsArray.map((a) => ({ ...a }));
  },
  methods: {
    async removeFocus() {
      this.currently_edited_index = undefined;
      this.edited_data[this.titleKey] = '';
      this.edited_data[this.textKey] = '';
      this.$emit('toggle-editing', false);
    },
    async emitEdit(indexChanged, originalSection) {
      try {
        this.saving = true;
        this.sections[indexChanged] = { ...this.edited_data };
        await dataToParent({ thisObj: this, data: this.sections });
        this.removeFocus();
        this.saving = false;
      } catch (error) {
        this.sections[indexChanged] = originalSection;
        this.saving = false;
        // In some cases, we only want the top level component to
        // display the error message
        if (error.displayMessage === false) return;
        this.couldNotSave = true;
        console.log(error);
      }
    },
    addSection(index) {
      if (!Number.isInteger(index)) {
        throw Error('Index should be integer');
      }
      const blankSection = {
        [this.titleKey]: '',
        [this.textKey]: '',
      };
      this.sections.splice(index, 0, blankSection);
      this.edit(index, blankSection[this.titleKey], blankSection[this.textKey]);
    },
    async deleteSection(index) {
      if (!Number.isInteger(index)) {
        throw Error('Index should be integer');
      }

      this.saving = true;
      const section = this.sections[index];
      try {
        // delete from array without leaving a hole
        this.sections.splice(index, 1);
        await dataToParent({ thisObj: this, data: this.sections });
        this.removeFocus();
        this.saving = false;
      } catch (error) {
        this.sections.splice(index, 0, section);
        this.saving = false;
        this.couldNotSave = true;
      }
    },
    edit(index, text, title) {
      if (this.saving) {
        return;
      }
      if (index !== this.currently_edited_index) {
        this.currently_edited_index = index;
        this.edited_data[this.textKey] = text;
        this.edited_data[this.titleKey] = title;
        this.$emit('toggle-editing', true);
      }
    },
    showDeleteConfirmation(index) {
      this.$bvModal
        .msgBoxConfirm(this.deleteConfirmationMessage, {
          title: 'Please Confirm',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true,
        })
        .then((value) => {
          if (value) {
            this.deleteSection(index);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    deleteIfNew(index, section) {
      if (section[this.titleKey] === '' && section[this.textKey] === '') {
        // delete from array without leaving a hole
        this.sections.splice(index, 1);
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
