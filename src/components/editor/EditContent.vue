<template>
  <div class="documentation_editor">
    <b-container fluid>
      <b-row>
        <b-col>
          <b-card>
            <div @dblclick="readOnly === false ? edit() : {}">
              <div v-if="!editing" align="left">
                <p>
                  <span
                    class="pointer"
                    @click="edit()"
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
                <!--This displays markdown.-->
                <viewer
                  class="user-text"
                  :initialValue="documentation"
                  :options="viewerOptions"
                />
              </div>
              <!--This appears for editing documentation-->
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
                <!--<b-container>
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
          </b-container>-->

                <b-button-toolbar>
                  <!--The save button is disabled when the boxes are empty,
                  are not changed, or if the app is in the process of saving-->
                  <b-button
                    variant="primary"
                    @click="emitEdit()"
                    :disabled="
                      edited_documentation === '' ||
                      edited_documentation === documentation ||
                      saving
                    "
                    aria-controls="sidebar-in-text"
                    :aria-expanded="insert_reference.toString()"
                    >Save</b-button
                  >

                  <!--The cancel button is disabled when the app is in the process of saving-->
                  <b-button
                    variant="warning"
                    @click="removeFocus()"
                    :disabled="saving === true"
                    aria-controls="sidebar-in-text"
                    :aria-expanded="insert_reference.toString()"
                    >Cancel</b-button
                  >
                  <b-button
                    v-b-toggle.sidebar-in-text
                    :disabled="saving || insert_reference"
                    >Insert Reference</b-button
                  >
                  <b-spinner v-show="saving === true" />
                </b-button-toolbar>
              </div>
            </div>
            <b-sidebar
              id="sidebar-in-text"
              title="In-Text Citations"
              width="490px"
              v-model="insert_reference"
              lazy
              right
              shadow
            >
              <add-references
                @clickedRef="
                  insertReference(arguments[0], arguments[1], arguments[2])
                "
              />
              <create-custom-reference @add-ref="insertReference(arguments[0], arguments[1], arguments[2])"/>

            </b-sidebar>

            <b-modal
              v-model="couldNotSave"
              v-b-modal.modal-center
              ok-only
              :static="true"
              >We couldn't save. Check your internet connection and try again.
              If the problem persists, contact the administrator.</b-modal
            >
          </b-card>
          <b-overlay :show="refsLoading" rounded="sm">
            <b-table striped hover :items="items" :fields="table_fields">
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
                      v-else
                      :class="`${
                        $route.hash === `#${data.item.doi}`
                          ? 'raw-html-active'
                          : ''
                      }`"
                      v-html="data.value"
                    ></span>
                  </a>
                </div>
              </template>
            </b-table>
          </b-overlay>
        </b-col>
        <b-col lg="4" v-show="insert_reference"> </b-col>
      </b-row>
    </b-container>
    <b-popover
      v-if="showPopOver"
      :show="showPopOver"
      :target="popOverTarget"
      placement="top"
      ><div v-html="popOverHtml"
    /></b-popover>
  </div>
</template>

<script>
import AddReferences from '@/components/references/AddReferences.vue';
import DOMPurify from 'dompurify';
import CreateCustomReference from '@/components/references/customReferences/CreateCustomReference.vue';

import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
// import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Editor, Viewer } from '@toast-ui/vue-editor';
import dataToParent from '@/components/utils/dataToParent';
import refUtils from '@/components/references/utils';
import { BIconPencilSquare } from 'bootstrap-vue';

const TOGGLE_SUBSCRIPT_EVENT = 'TOGGLE_SUBSCRIPT';
const TOGGLE_SUPERSCRIPT_EVENT = 'TOGGLE_SUPERSCRIPT';

export default {
  components: {
    'add-references': AddReferences,
    Editor,
    Viewer,
    BIconPencilSquare,
    CreateCustomReference,
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
      viewerOptions: {
        customHTMLSanitizer: (html) => DOMPurify.sanitize(html),
      },
      editorOptions: {
        usageStatistics: false,
        hideModeSwitch: true,
        customHTMLSanitizer: (html) => DOMPurify.sanitize(html),
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
      showPopOver: false,
      popOverHtml: '',
      popOverTarget: undefined,
      // Here we keep reference data that
      // we just inserted in the doc so that
      // we can have pop ups with the html of that citation
      justInsertedReferences: [],
      items: [],
      edited_documentation: '',
      table_fields: [
        { key: 'index', label: '' },
        { key: 'citation', label: 'Citations' },
      ],
      editing: false,
      saving: false,
      refsLoading: false,
      couldNotSave: false,
      insert_reference: false,
      focused: false,
      // curr_mode: 'wysiwyg',
    };
  },
  mounted() {
    this.edited_documentation = this.documentation;
    this.extractReferences();
    this.$el.addEventListener(TOGGLE_SUBSCRIPT_EVENT, this.toggleSubScript);
    this.$el.addEventListener(TOGGLE_SUPERSCRIPT_EVENT, this.toggleSuperScript);
    this.$el.addEventListener('mouseover', this.onLinkMouseover);
    this.$el.addEventListener('mouseout', this.onLinkMouseout);
  },
  destroyed() {
    this.$el.removeEventListener(TOGGLE_SUBSCRIPT_EVENT, this.toggleSubScript);
    this.$el.removeEventListener(TOGGLE_SUPERSCRIPT_EVENT, this.toggleSuperScript);
    this.$el.removeEventListener('mouseover', this.onLinkMouseover);
    this.$el.addEventListener('mouseout', this.onLinkMouseout);
  },
  methods: {
    addCustomButtons() {
      const ui = this.$refs['markdown-input'].invoke('getUI');
      console.log(this.$refs);
      const thisObj = this;
      this.$refs['markdown-input'].editor.eventManager.addEventType(TOGGLE_SUBSCRIPT_EVENT);
      this.$refs['markdown-input'].editor.eventManager.listen(TOGGLE_SUBSCRIPT_EVENT, () => {
        thisObj.toggleSubScript();
      });

      this.$refs['markdown-input'].editor.eventManager.addEventType(TOGGLE_SUPERSCRIPT_EVENT);
      this.$refs['markdown-input'].editor.eventManager.listen(TOGGLE_SUPERSCRIPT_EVENT, () => {
        thisObj.toggleSuperScript();
      });

      const toolbar = ui.getToolbar();
      console.log(toolbar);
      toolbar.insertItem(20, {
        type: 'button',
        options: {
          event: TOGGLE_SUBSCRIPT_EVENT,
          tooltip: 'subscript',
          text: 'xₙ',
          className: 'first',
          style: 'background:none;color:black;',
        },
      });
      toolbar.insertItem(20, {
        type: 'button',
        options: {
          event: TOGGLE_SUPERSCRIPT_EVENT,
          tooltip: 'superscript',
          text: 'xⁿ',
          className: 'first',
          style: 'background:none;color:black;',
        },
      });
    },
    toggleSubScript() {
      this.toggleCustomStyle('sub');
    },
    toggleSuperScript() {
      this.toggleCustomStyle('sup');
    },
    toggleCustomStyle(tag) {
      const { editor } = this.$refs['markdown-input'];
      // Squire is a lower level editor used by the tui
      // Squire documentation: https://github.com/neilj/Squire/blob/master/README.md
      const squire = editor.getSquire();

      if (squire.hasFormat(tag)) {
        squire.changeFormat(null, { tag }, null);
      } else {
        squire.changeFormat({ tag }, null, null);
      }
      editor.focus();
    },
    onLinkMouseout(event) {
      if (
        event.target.tagName === 'A'
        && event.target.attributes.href.nodeValue.startsWith('#10.')
      ) {
        this.showPopOver = false;
        this.popOverTarget = undefined;
        this.popOverHtml = '';
      }
    },
    onLinkMouseover(event) {
      if (event.target.tagName === 'A') {
        const url = event.target.attributes.href.nodeValue;
        if (url.startsWith('#10.')) {
          const doi = url.substring(1);
          let citationData = this.items.find((elem) => elem.doi === doi);
          if (citationData === undefined) {
            citationData = this.justInsertedReferences.find((elem) => elem.doi === doi);
          }
          if (citationData === undefined) {
            return;
          }
          this.popOverHtml = citationData.citation;
          this.popOverTarget = event.target;
          this.showPopOver = true;
        }
      }
    },
    /* changeMode() {
      const editor = this.$refs['markdown-input'];
      if (this.curr_mode === 'markdown') {
        this.curr_mode = 'wysiwyg';
        editor.invoke('changeMode', 'wysiwyg');
      } else if (this.curr_mode === 'wysiwyg') {
        editor.invoke('changeMode', 'markdown');
        this.curr_mode = 'markdown';
      }
    }, */
    onContentChange() {
      this.edited_documentation = this.$refs['markdown-input'].invoke('getMarkdown');
    },
    async removeFocus() {
      this.editing = false;
      this.edited_documentation = this.documentation;
      this.justInsertedReferences = [];
      this.$emit('toggle-editing', false);
      this.insert_reference = false;
    },

    async emitEdit() {
      try {
        this.saving = true;
        await dataToParent({ thisObj: this, data: this.edited_documentation });
        this.removeFocus();
        this.extractReferences();
        this.saving = false;
        this.insert_reference = false;
      } catch (error) {
        this.saving = false;
        console.log(error);
        // In some cases, we only want the top level component to
        // display the error message
        if (error.displayMessage === false) return;

        this.couldNotSave = true;
      }
    },

    async insertReference(text, doi, citationHTML) {
      const editor = this.$refs['markdown-input'];
      editor.invoke('exec', 'AddLink', { linkText: text, url: `#${doi}` });
      this.justInsertedReferences.push({ doi, citation: citationHTML });
    },
    isDoiFormat(string) {
      if (string.startsWith('10.') && string.includes('/')) {
        return true;
      }
      return false;
    },

    extractReferences() {
      const refsSet = new Set();
      // The regex here matches this pattern: [(citation goes here)](#url goes here)
      const matches = [...this.edited_documentation.matchAll(/\[\([^\s].*?\)\]\(#([^\s].*?)\)/g)];
      matches.forEach((match) => {
        const doiRef = match[1];
        if (!this.isDoiFormat(doiRef)) {
          return;
        }
        refsSet.add(doiRef.trim());
      });
      this.getReferenceCitations(refsSet);
    },
    async getReferenceCitations(referencesSet) {
      this.refsLoading = true;
      const items = await Promise.all(
        [...referencesSet].map(async (doi) => {
          const reference = this.items.find((elem) => elem.doi === doi);
          if (reference !== undefined && reference.error === false) {
            return reference;
          }
          return refUtils.getRefOrCreateIfNotExists(doi);
        }),
      );
      this.refsLoading = false;
      this.items = items;
    },
    async edit() {
      this.editing = true;
      await this.$nextTick();
      this.addCustomButtons();
      // this.curr_mode = 'wysiwyg';
      this.$emit('toggle-editing', true);
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
