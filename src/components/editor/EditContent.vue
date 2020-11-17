<template>
  <div class="documentation_editor">
    <div align="left">
      <b-icon-plus-circle-fill
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
          <div @dblclick="edit(index, section[textKey], section[titleKey])">
            <div v-show="index !== currently_edited_index">
              <p>
                <strong>{{ section[titleKey] }}</strong>
                <span
                  class="pointer"
                  @click="edit(index, section[textKey], section[titleKey])"
                >
                  <u>[edit]</u>
                </span>
                <span class="text-muted" style="font-size: 0.8rem"
                  >(or double click)</span
                >
              </p>
              <!--This parses the markdown and displays it-->
              <div class="user-text" v-html="parseText(section[textKey])" />
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
                :ref="`input${index}`"
                @focus="focused = true"
                @blur="focused = false"
              />
              <b-button-toolbar>
                <!--The save button is disabled when the boxes are empty, are not changed, or if the app is in the process of saving-->
                <b-button
                  variant="primary"
                  @click="emitEdit(index, section)"
                  :disabled="
                    edited_data[titleKey] === '' ||
                    edited_data[textKey] === '' ||
                    (edited_data[titleKey] === section[titleKey] &&
                      edited_data[textKey] === section[textKey]) ||
                    saving
                  "
                  >Save</b-button
                >

                <!--The cancel button is disabled when the app is in the process of saving-->
                <b-button
                  variant="danger"
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
                  variant="warning"
                  @click="showDeleteConfirmation(index)"
                  v-show="
                    !(section[titleKey] === '' || section[textKey] === '') &&
                    !saving
                  "
                  >{{ removeButtonText }}</b-button
                >
                <b-button
                  @mousedown="insert_reference_dialog()"
                  :disabled="!focused"
                  v-show="referenceUidsArray != undefined"
                  >Insert Reference</b-button
                >
                <b-modal v-model="insert_reference" ok-only>
                  <add-references
                    :references-array="referenceUidsArray"
                    :insertion-mode="true"
                    @clickedRef="insertReference(arguments[0].data)"
                  />
                </b-modal>

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
          v-show="currently_edited_index !== index"
          :class="`${
            currently_edited_index === undefined ? 'pointer' : ''
          } mt-2`"
          @click="
            currently_edited_index === undefined ? addSection(index + 1) : {}
          "
        />
      </div>
      <b-table striped hover :items="items"/>
    </div>
  </div>
</template>

<script>
// import ExperimentLineChart from '@/components/ExperimentLineChart.vue';
import utils from '@/utils';
import AddReferences from '@/components/editor/AddReferences.vue';
import { BIconPlusCircleFill } from 'bootstrap-vue';

export default {
  props: {
    sectionsArray: Array,
    referenceUidsArray: {
      validator(value) {
        if (value === undefined || value instanceof Array) {
          return 'success';
        }
        return 'danger';
      },
    },
    markdown: {
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
      default:
        "Are you sure you want to delete this section? This can't be undone.",
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
      // referenceUids: [],
      currently_edited_index: undefined,
      edited_data: {
        [this.titleKey]: '',
        [this.textKey]: '',
      },
      references: [],
      referencesCount: {},
      saving: false,
      couldNotSave: false,
      insert_reference: false,
      focused: false,
    };
  },

  computed: {
    // Derive a list of references from the count object
    // for the b-table to render from
    items() {
      const { referencesCount } = this;
      const items = Object.keys(this.referencesCount).filter((key) => {
        if (referencesCount[key] === 0) {
          return false;
        }
        return true;
      }).map((key) => ({ reference: key }));
      return items;
    },
  },
  mounted() {
    // clone the array of objects along with their primitives
    // into an internal data property we can mess around with
    // note that this does not clone nested objects
    // https://stackoverflow.com/a/40283265/8903570
    this.sections = this.sectionsArray.map((a) => ({ ...a }));
    this.buildReferences();
    // this.referenceUids = this.referenceUidsArray.slice();
  },
  methods: {
    focusChanged(event) {
      // this lets me see which element is focused on
      this.focusedElement = event.target;
    },
    insert_reference_dialog() {
      this.insert_reference = true;
      console.log('hello');
    },
    async removeFocus() {
      this.currently_edited_index = undefined;
      this.edited_data[this.titleKey] = '';
      this.edited_data[this.textKey] = '';
    },
    async emitToParent(array) {
      // This emits an object with the altered data section, and
      // a callback for the parent component to call with a boolean as the argument,
      // so that this component can know whether not the data was saved succesfully
      // if the data was succesfully saved then the code will execute as normal.
      // if not then this function will throw an error
      // Partly inspired by how this programmer awaits a settimeout https://stackoverflow.com/a/51939030/8903570
      return new Promise((resolve, reject) => this.$emit('dataToParent', {
        data: array,
        callback: (success) => {
          if (success) {
            resolve();
          } else {
            reject();
          }
        },
      }));
    },
    async emitEdit(indexChanged, originalSection) {
      try {
        this.saving = true;
        this.sections[indexChanged] = { ...this.edited_data };
        await this.emitToParent(this.sections);

        // update references
        const links = this.extractReferences(this.sections[indexChanged][this.textKey]);
        this.subtractReferencesFromCount(this.references[indexChanged]);
        this.addReferencesToCount(links);
        // Preserve reactivity
        this.$set(this.references, indexChanged, links);

        this.removeFocus();
        this.saving = false;
      } catch (error) {
        this.sections[indexChanged] = originalSection;
        this.saving = false;
        this.couldNotSave = true;
      }
    },

    // adapted from https://forum.vuejs.org/t/vuejs-vuetify-add-some-text-to-focus-position-on-textarea/33279/4
    async insertReference(uid) {
      console.log(uid);
      const referenceLink = `[[reference]](#${uid})`;
      const textArea = this.$refs[`input${this.currently_edited_index}`][0];
      console.log(textArea);
      textArea.focus();
      const startPos = textArea.selectionStart;
      // get cursor's position:
      let cursorPos = startPos;
      const tmpStr = textArea.value;

      // insert:
      this.edited_data[this.textKey] = `${tmpStr.substring(
        0,
        startPos,
      )}${referenceLink}${tmpStr.substring(startPos, tmpStr.length)}`;

      // move cursor:
      await this.$nextTick();
      cursorPos += referenceLink.length;
      textArea.selectionStart = cursorPos;
      textArea.selectionEnd = cursorPos;
      this.insert_reference = false;
    },
    /* async insertNewReference(eventObj) {
      this.uids.push(eventObj.data.uid);
      this.saving = true;
      try {
        await this.emitToParent('dataToParent', this.uids);
        this.references.push(eventObj.data);
        this.saving = false;
        eventObj.callback(true);
      } catch (e) {
        this.uids.pop();
        this.saving = false;
        this.couldNotSave = true;
        eventObj.callback(false);
        console.log(e);
    }, */
    addSection(index) {
      if (!Number.isInteger(index)) {
        throw Error('Index should be integer');
      }
      const blankSection = {
        [this.titleKey]: '',
        [this.textKey]: '',
      };
      this.sections.splice(index, 0, blankSection);
      this.references.splice(index, 0, []);
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
        await this.emitToParent(this.sections);
        this.removeFocus();
        this.subtractReferencesFromCount(this.references[index]);
        this.references.splice(index, 1);
        this.saving = false;
      } catch (error) {
        this.sections.splice(index, 0, section);
        this.saving = false;
        this.couldNotSave = true;
      }
    },
    extractReferences(text) {
      const links = [];
      // The regex here matches this pattern: [[reference]](#url goes here)
      const matches = [...text.matchAll(/\[\[reference\]\]\(#(.*?)\)/g)];

      matches.forEach((match) => {
        const link = match[1];
        links.push(link);
      });
      return links;
    },
    addReferencesToCount(links) {
      links.forEach((link) => {
        if (this.referencesCount[link] === undefined) {
          // assign 1 to the property in this way to preserve
          // reactivity https://vuejs.org/v2/guide/reactivity.html#For-Objects
          this.$set(this.referencesCount, link, 1);
        } else {
          this.referencesCount[link] += 1;
        }
      });
    },
    subtractReferencesFromCount(links) {
      links.forEach((link) => {
        if (this.referencesCount[link] === undefined) {
          return;
        }
        this.referencesCount[link] -= 1;
      });
    },
    updateReferences(index) {
      this.references[index].forEach();
    },
    buildReferences() {
      const references = [];
      this.sections.forEach((section) => {
        const links = this.extractReferences(section[this.textKey]);
        this.addReferencesToCount(links);
        references.push(links);
      });
      this.references = references;
    },
    edit(index, text, title) {
      if (this.saving) {
        return;
      }
      if (index !== this.currently_edited_index) {
        this.currently_edited_index = index;
        this.edited_data[this.textKey] = text;
        this.edited_data[this.titleKey] = title;
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
        this.references.splice(index, 1);
      }
    },
    parseText(text) {
      if (this.markdown) {
        return utils.parseMarkDown(text);
      }
      return utils.sanitizeInput(text);
    },
  },
  components: {
    'b-icon-plus-circle-fill': BIconPlusCircleFill,
    'add-references': AddReferences,
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
