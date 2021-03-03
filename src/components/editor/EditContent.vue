<template>
  <div class="documentation_editor">
        <b-card>
          <div
            @dblclick="
              readOnly === false
                ? edit()
                : {}
            "
          >
            <div v-if="!editing" align="left">
              <p>
                <span
                  class="pointer"
                  @click="edit()"
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
                :initialValue="documentation"
              />
            </div>
            <!--This appears when we want to edit the documentation-->
            <div v-if="editing" align="left">
                <editor
                  :initialValue="edited_documentation"
                  :options="editorOptions"
                  ref="markdown-input"
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
                        >Raw editor</b-button
                      >
                    </b-button-group>
                  </b-row>
                </b-container>

              <b-button-toolbar>
                <!--The save button is disabled when the boxes are empty, are not changed, or if the app is in the process of saving-->
                <b-button
                  variant="primary"
                  @click="emitEdit()"
                  :disabled="
                    edited_documentation === '' ||
                    edited_documentation === documentation ||
                    saving
                  "
                  >Save</b-button
                >

                <!--The cancel button is disabled when the app is in the process of saving-->
                <b-button
                  variant="warning"
                  @click="
                    removeFocus();
                  "
                  :disabled="saving === true"
                  >Cancel</b-button
                >
                <b-button
                  @mousedown="insert_reference = true"
                  :disabled="!focused"
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

          <b-modal
            v-model="couldNotSave"
            v-b-modal.modal-center
            ok-only
            :static="true"
            >We couldn't save. Check your internet connection and try again. If
            the problem persists, contact the administrator.</b-modal
          >
        </b-card>
      <b-overlay :show="refsLoading" rounded="sm">
        <b-table
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
</template>

<script>
import AddReferences from '@/components/editor/AddReferences.vue';
import Citation from 'citation-js';

import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
// import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Editor, Viewer } from '@toast-ui/vue-editor';

const CITE_FORMAT = { format: 'html', template: 'apa', lang: 'en-US' };
export default {
  components: {
    'add-references': AddReferences,
    Editor,
    Viewer,
  },
  props: {
    documentation: String,
    readOnly: {
      type: Boolean,
      default: false,
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
      edited_documentation: '',
      referencesCount: {},
      items: [],
      table_fields: [{ key: 'index', label: '' }, 'citation'],
      editing: false,
      saving: false,
      refsLoading: false,
      couldNotSave: false,
      insert_reference: false,
      focused: false,
      curr_mode: 'wysiwyg',
    };
  },
  mounted() {
    this.edited_documentation = this.documentation;
    this.buildReferences();
  },
  methods: {
    changeMode() {
      const editor = this.$refs['markdown-input'];
      if (this.curr_mode === 'markdown') {
        this.curr_mode = 'wysiwyg';
        editor.invoke('changeMode', 'wysiwyg');
      } else if (this.curr_mode === 'wysiwyg') {
        editor.invoke('changeMode', 'markdown');
        this.curr_mode = 'markdown';
      }
    },
    onContentChange() {
      this.edited_documentation = this.$refs['markdown-input'].invoke('getMarkdown');
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
      this.editing = false;
      this.edited_documentation = this.documentation;
      this.$emit('toggle-editing', false);
    },
    async emitToParent(data) {
      // This emits an object with the altered data, and
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
    async emitEdit() {
      try {
        this.saving = true;
        await this.emitToParent(this.edited_documentation);
        this.removeFocus();
        this.buildReferences();
        this.saving = false;
      } catch (error) {
        this.saving = false;
        this.couldNotSave = true;
        console.log(error);
      }
    },

    async insertReference(text, doi) {
      console.log(doi);
      const editor = this.$refs['markdown-input'];
      editor.invoke('exec', 'AddLink', { linkText: text, url: `#${doi}` });
      this.insert_reference = false;
    },

    extractReferences(text) {
      const doiRefs = [];
      // The regex here matches this pattern: [(citation goes here)](#url goes here)
      const matches = [...text.matchAll(/\[\([^\s].*?\)\]\(#([^\s].*?)\)/g)];
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
      const doiRefs = this.extractReferences(this.documentation);
      this.addReferencesToCount(doiRefs);
    },
    edit() {
      this.editing = true;
      this.curr_mode = "wysiwyg";
      this.$emit('toggle-editing', true);
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
