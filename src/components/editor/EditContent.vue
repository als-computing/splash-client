<template>
  <div class="documentation_editor">
    <b-card>
      <div @dblclick="readOnly === false ? edit() : {}">
        <div v-if="!editing" align="left">
          <p>
            <span class="pointer" @click="edit()" v-if="readOnly !== true">
              <b-icon-pencil-square class="mx-1"/>
            </span>
            <span
              class="text-muted"
              style="font-size: 0.8rem"
              v-if="readOnly !== true"
              >(or double click)</span
            >
          </p>
          <!--This parses the markdown and displays it-->
          <viewer class="user-text" :initialValue="documentation" />
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
              @click="removeFocus()"
              :disabled="saving === true"
              >Cancel</b-button
            >
            <b-button @mousedown="insert_reference = true" :disabled="!focused || saving"
              >Insert Reference</b-button
            >
            <b-modal v-model="insert_reference" ok-only>
              <add-references
                @clickedRef="
                  insertReference(arguments[0], arguments[1], arguments[2])
                "
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
        >We couldn't save. Check your internet connection and try again. If the
        problem persists, contact the administrator.</b-modal
      >
    </b-card>
    <b-popover
      v-if="showPopOver"
      :show="showPopOver"
      :target="popOverTarget"
      placement="top"
      ><div v-html="popOverHtml"
    /></b-popover>
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
                  $route.hash === `#${data.item.doi}` ? 'raw-html-active' : ''
                }`"
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

import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
// import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Editor, Viewer } from '@toast-ui/vue-editor';
import utils from '@/components/editor/utils';
import {BIconPencilSquare} from 'bootstrap-vue';

export default {
  components: {
    'add-references': AddReferences,
    Editor,
    Viewer,
    BIconPencilSquare,
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
      showPopOver: false,
      popOverHtml: '',
      popOverTarget: undefined,
      // Here we keep reference data that
      // we just inserted in the doc so that
      // we can have pop ups with the html of that citation
      justInsertedReferences: [],
      items: [],
      edited_documentation: '',
      table_fields: [{ key: 'index', label: '' }, { key: 'citation', label: 'Citations' }],
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
    this.extractReferences();
    this.$el.addEventListener('mouseover', this.onLinkMouseover);
    this.$el.addEventListener('mouseout', this.onLinkMouseout);
  },
  destroyed() {
    this.$el.removeEventListener('mouseover', this.onLinkMouseover);
    this.$el.addEventListener('mouseout', this.onLinkMouseout);
  },
  methods: {
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
    async removeFocus() {
      this.editing = false;
      this.edited_documentation = this.documentation;
      this.justInsertedReferences = [];
      this.$emit('toggle-editing', false);
    },
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
    async emitEdit() {
      try {
        this.saving = true;
        await this.emitToParent(this.edited_documentation);
        this.removeFocus();
        await this.extractReferences();
        this.saving = false;
      } catch (error) {
        this.saving = false;
        this.couldNotSave = true;
        console.log(error);
      }
    },

    async insertReference(text, doi, citationHTML) {
      const editor = this.$refs['markdown-input'];
      editor.invoke('exec', 'AddLink', { linkText: text, url: `#${doi}` });
      this.justInsertedReferences.push({ doi, citation: citationHTML });
      this.insert_reference = false;
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
          return utils.getRefOrCreateIfNotExists(doi);
        }),
      );
      this.refsLoading = false;
      this.items = items;
    },
    edit() {
      this.editing = true;
      this.curr_mode = 'wysiwyg';
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
