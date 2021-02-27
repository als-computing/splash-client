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
                  <u>[edit]</u>
                </span>
                <span
                  class="text-muted"
                  style="font-size: 0.8rem"
                  v-if="readOnly !== true"
                  >(or double click)</span
                >
              </p>
              <!--This parses the markdown and displays it-->
              <viewer
                class="user-text"
                v-if="markdown"
                :initialValue="section[textKey]"
              />
              <div v-else>{{ section[textKey] }}</div>
            </div>

            <!--This appears when we want to edit the documentation-->
            <div v-if="index === currently_edited_index">
              <span class="text-muted">{{ titleInputName }}:</span>
              <b-form-input
                v-model="edited_data[titleKey]"
                :readonly="saving"
              />
              <span class="text-muted">{{ valueInputName }}:</span>
              <div v-if="markdown">
                <editor
                  :initialValue="edited_data[textKey]"
                  :options="editorOptions"
                  :ref="`input${index}`"
                  initialEditType="wysiwyg"
                  height="40vh"
                  @change="onContentChange"
                  @focus="focused = true"
                  @blur="focused = false"
                />
                <b-container>
                  <b-row align-h="end">
                    <b-button-group>
                      <b-button
                        size="sm"
                        :disabled="curr_mode === 'wysiwyg'"
                        @click="changeMode"
                        >Easy editor</b-button
                      >
                      <b-button
                        size="sm"
                        :disabled="curr_mode === 'markdown'"
                        @click="changeMode"
                        >Raw text</b-button
                      >
                    </b-button-group>
                  </b-row>
                </b-container>
              </div>
              <b-form-textarea
                v-model="edited_data[textKey]"
                max-rows="100"
                :readonly="saving"
                v-if="!markdown"
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
                <b-button
                  @mousedown="insert_reference = true"
                  :disabled="!focused"
                  v-show="markdown === true"
                  >Insert Reference</b-button
                >
                <b-modal v-model="insert_reference" ok-only>
                  <add-references
                    :references="items"
                    @clickedRef="insertReference(arguments[0], arguments[1])"
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
          v-show="currently_edited_index !== index && readOnly !== true"
          :class="`${
            currently_edited_index === undefined ? 'pointer' : ''
          } mt-2`"
          @click="
            currently_edited_index === undefined ? addSection(index + 1) : {}
          "
        />
      </div>
      <b-overlay :show="refsLoading" rounded="sm">
        <b-table
          v-if="markdown"
          striped
          hover
          :items="items"
          :fields="table_fields"
        >
          <template #cell(index)="data"> {{ data.index + 1 }}. </template>
          <template #cell(citation)="data">
            <div align="left">
              <a :name="data.item.doi">
                <span
                  :class="`${
                    $route.hash === `#${data.item.doi}` ? 'active' : ''
                  }`"
                  v-if="items[data.index].error"
                  >{{ data.value }}</span
                >
                <span
                  :class="`${
                    $route.hash === `#${data.item.doi}` ? 'raw-html-active' : ''
                  }`"
                  v-else
                  v-html="data.value"
                ></span>
              </a>
            </div>
          </template>
        </b-table>
      </b-overlay>
    </div>
  </div>
</template>

<script>
// import ExperimentLineChart from '@/components/ExperimentLineChart.vue';
import utils from '@/utils';
import AddReferences from '@/components/editor/AddReferences.vue';
import { BIconPlusCircleFill } from 'bootstrap-vue';
import Citation from 'citation-js';

import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
// import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Editor, Viewer } from '@toast-ui/vue-editor';

const CITE_FORMAT = { format: 'html', template: 'apa', lang: 'en-US' };
export default {
  components: {
    'b-icon-plus-circle-fill': BIconPlusCircleFill,
    'add-references': AddReferences,
    Editor,
    Viewer,
  },
  props: {
    sectionsArray: Array,
    markdown: {
      type: Boolean,
      default: false,
    },
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
      editorOptions: {
        usageStatistics: false,
        hideModeSwitch: true,
        // This array contains all default items in toolbar except for images
        toolbarItems: [
          'heading',
          'bold',
          'italic',
          'strike',
          'divider',
          'hr',
          'quote',
          'divider',
          'ul',
          'ol',
          'task',
          'indent',
          'outdent',
          'divider',
          'table',
          'link',
          'divider',
          'code',
          'codeblock',
        ],
      },
      sections: [],
      currently_edited_index: undefined,
      edited_data: {
        [this.titleKey]: '',
        [this.textKey]: '',
      },
      referencesCount: {},
      items: [],
      table_fields: [{ key: 'index', label: '' }, 'citation'],
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
    this.buildReferences();
  },
  methods: {
    changeMode() {
      const editor = this.$refs[`input${this.currently_edited_index}`][0];
      if (this.curr_mode === 'markdown') {
        this.curr_mode = 'wysiwyg';
        editor.invoke('changeMode', 'wysiwyg');
      } else if (this.curr_mode === 'wysiwyg') {
        editor.invoke('changeMode', 'markdown');
        this.curr_mode = 'markdown';
      }
    },
    onContentChange() {
      this.edited_data[this.textKey] = this.$refs[`input${this.currently_edited_index}`][0].invoke(
        'getMarkdown',
      );
    },
    async getDOIFromService(doi) {
      const response = await this.$doi_service.get(`/${doi}`);
      return response;
    },
    async getSplashReference(doi) {
      const response = await this.$api.get(`${this.$references_url}/doi/${doi}`);
      return response;
    },
    async createReference(reference) {
      const response = await this.$api.post(`${this.$references_url}`, reference);
      return response;
    },
    async updateReference(reference, doi) {
      const response = await this.$api.put(`${this.$references_url}/doi/${doi}`, reference);
      return response;
    },
    async removeFocus() {
      this.currently_edited_index = undefined;
      this.edited_data[this.titleKey] = '';
      this.edited_data[this.textKey] = '';
    },
    async emitToParent(data) {
      // This emits an object with the altered data section, and
      // a callback for the parent component to call with a boolean as the argument,
      // so that this component can know whether not the data was saved succesfully
      // if the data was succesfully saved then the code will execute as normal.
      // if not then this function will throw an error
      // Partly inspired by how this programmer awaits a settimeout https://stackoverflow.com/a/51939030/8903570
      return new Promise((resolve, reject) =>
        this.$emit('dataToParent', {
          data,
          callback: (success) => {
            if (success) {
              resolve();
            } else {
              reject();
            }
          },
        }),
      );
    },
    async emitEdit(indexChanged, originalSection) {
      try {
        this.saving = true;
        this.sections[indexChanged] = { ...this.edited_data };
        await this.emitToParent(this.sections);
        this.removeFocus();
        this.buildReferences();
        this.saving = false;
      } catch (error) {
        this.sections[indexChanged] = originalSection;
        this.saving = false;
        this.couldNotSave = true;
        console.log(error);
      }
    },

    async insertReference(text, doi) {
      console.log(doi);
      const editor = this.$refs[`input${this.currently_edited_index}`][0];
      editor.invoke('exec', 'AddLink', { linkText: text, url: `#${doi}` });
      this.insert_reference = false;
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
        await this.emitToParent(this.sections);
        this.removeFocus();
        this.buildReferences();
        this.saving = false;
      } catch (error) {
        this.sections.splice(index, 0, section);
        this.saving = false;
        this.couldNotSave = true;
      }
    },
    extractReferences(text) {
      const doiRefs = [];
      // The regex here matches this pattern: [(citation goes here)](#url goes here)
      const matches = [...text.matchAll(/\[\([^\s].*\)\]\(#([^\s].*?)\)/g)];
      matches.forEach((match) => {
        const doiRef = match[1];
        if (!this.isDoiFormat(doiRef)) {
          return;
        }
        doiRefs.push(doiRef.trim());
      });
      return doiRefs;
    },
    isDoiFormat(string) {
      if (string.startsWith('10.') && string.includes('/')) {
        return true;
      }
      return false;
    },
    addReferencesToCount(doiRefs) {
      doiRefs.forEach((doiRef) => {
        if (this.referencesCount[doiRef] === undefined) {
          // assign 1 to the property in this way to preserve
          // reactivity https://vuejs.org/v2/guide/reactivity.html#For-Objects
          this.$set(this.referencesCount, doiRef, 1);
        } else {
          this.referencesCount[doiRef] += 1;
        }
      });
    },
    subtractReferencesFromCount(doiRefs) {
      doiRefs.forEach((doiRef) => {
        if (this.referencesCount[doiRef] === undefined) {
          return;
        }
        this.referencesCount[doiRef] -= 1;
      });
    },
    buildReferences() {
      this.referencesCount = {};
      this.sections.forEach((section) => {
        const doiRefs = this.extractReferences(section[this.textKey]);
        this.addReferencesToCount(doiRefs);
      });
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
      }
    },
    /* parseText(htmlText) {
      const { referencesCount } = this;
      const renderer = {
        link(href, title, text) {
          if (text !== '[reference]') {
            return false;
          }
          const references = Object.keys(referencesCount);
          // Slice removes the # at the beginning
          const index = references.indexOf(href.slice(1));
          if (index === -1) {
            return false;
          }
          return `<a href="${href}">[${index + 1}]</a>`;
        },
      };
      return utils.parseMarkDown(htmlText, renderer);
    }, */
  },
  watch: {
    // Derive a list of references from the count object
    // for the b-table to render from
    referencesCount: {
      deep: true,
      async handler() {
        this.saving = true;
        this.refsLoading = true;
        const { referencesCount } = this;
        const items = await Promise.all(
          Object.keys(this.referencesCount)
            .filter((doi) => {
              if (referencesCount[doi] === 0) {
                return false;
              }
              return true;
            })
            .map(async (doi) => {
              // First search through the previous items array to ensure
              // that we are not making unnecessary requests
              const reference = this.items.find((elem) => elem.doi === doi);
              if (reference !== undefined && reference.error === false) {
                return reference;
              }
              try {
                const response = await this.getSplashReference(doi);
                return {
                  doi,
                  citation: new Citation(response.data).format('bibliography', CITE_FORMAT),
                  error: false,
                };
              } catch (e) {
                console.log(e);
                if (e.response.status !== 404) {
                  return {
                    doi,
                    citation: `Error connecting to server when getting: ${doi}. Try reloading the page.`,
                    error: true,
                  };
                }
              }
              let response = {};
              try {
                response = await this.getDOIFromService(doi);
                console.log(response);
              } catch (e) {
                console.log(e);
                if (e.response.status === 404) {
                  // All the code commented out is when we attempt to create a new empty reference
                  // If one in the document does not exist. For now we are only notifying the user
                  // That it doesn't exist rather than making an empty one in the database
                  // try {
                  // await this.createReference({ DOI: doi, origin_url: 'none' });
                  return {
                    doi,
                    citation: `Could not find: ${doi}`,
                    error: true,
                  };
                  /* } catch (err) {
                    return {
                      doi,
                      citation: `${doi} COULDN'T SAVE REFERENCE TO SERVER OR GET REFERENCE INFO. FOR THE DEV: IMPLEMENT TRY AGAIN FUNCTIONALITY`,
                      html: false,
                    };
                  } */
                }
                return {
                  doi,
                  citation: `Error in creating new reference: ${doi}. Try reloading the page.`,
                  error: true,
                };
              }
              try {
                response.data.DOI = doi;
                response.data.origin_url = response.request.responseURL;
                await this.createReference(response.data);
                return {
                  doi,
                  citation: new Citation(response.data).format('bibliography', CITE_FORMAT),
                  error: false,
                };
              } catch (e) {
                console.log(e);
                return {
                  doi,
                  citation: `Error in creating new reference: ${doi}. Try reloading the page.`,
                  error: true,
                };
              }
            }),
        );
        this.refsLoading = false;
        this.saving = false;
        this.items = items;
      },
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
