<template>
  <div class="documentation_editor">
    <div align="left"></div>
    <b-card>
      <h4 v-if="referencesArray.length === 0">No references found.</h4>
      <span v-show="loading === true">Loading references...<b-spinner /></span>

      <b-alert show v-show="errorLoadingRefs" variant="danger"
        >Couldn't load all references (some may have been deleted from the
        system):
        <b-button @click="init">Retry</b-button>
      </b-alert>
      <b-table
        :hover="true"
        small
        :fields="tableFields"
        :items="references"
        responsive="sm"
        v-if="referencesArray.length !== 0 && !loading"
      >
        <template #cell(reference)="data">
          <a
            :name="insertionMode ? '' : data.item.uid"
            :class="`${
              ($route.hash === `#${data.item.uid}` && insertionMode === false)
                ? 'active'
                : ''
            }`"
          >
            <span :class="{ 'text-red': data.item.error }">
              {{ data.value }}
            </span>
          </a>
        </template>
        <template #cell(remove)="data">
          <b-icon-x
            :class="`${saving === false ? 'pointer' : ''}`"
            @click="saving === false ? showRemoveConfirmation(data.index) : {}"
            v-if="insertionMode === false"
          />
          <b-icon-plus
            :class="`${saving === false ? 'pointer' : ''}`"
            @click="saving === false ? plusClickHandler(data.item.uid) : {}"
            v-if="insertionMode === true"
          />
        </template>
      </b-table>
      <b-modal
        v-model="couldNotSave"
        v-b-modal.modal-center
        ok-only
        :static="true"
        >We couldn't save. Check your internet connection and try again. If the
        problem persists, contact the administrator.</b-modal
      >
    </b-card>
    <b-card class="mt-2" v-if="!insertionMode">
      <mongo-search
        button-text="Search References"
        query-key="search"
        :query-endpoint="$references_url"
        :fields-array="['reference', 'doi_url']"
        placeholder="Search References"
        :uids="uids"
        @dataToParent="addReference(arguments[0])"
      />
    </b-card>
  </div>
</template>

<script>
// import ExperimentLineChart from '@/components/ExperimentLineChart.vue';
import utils from "@/utils";
import { BIconPlus, BIconX } from "bootstrap-vue";
import MongoSearch from "@/components/MongoSearch.vue";

export default {
  props: {
    referencesArray: Array,
    // this tells me whether or not we want to
    // display the refs for insertion into the text, or if we want to add/remove from them
    insertionMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      tableFields: ["reference", "doi_url", { key: "remove", label: "" }],
      uids: [],
      references: [],
      saving: false,
      loading: true,
      errorLoadingRefs: false,
      couldNotSave: false,
    };
  },
  async mounted() {
    this.uids = this.referencesArray.slice();
    await this.init();
  },
  methods: {
    async init() {
      this.loading = true;
      this.errorLoadingRefs = false;
      this.references = await this.getReferences();
      this.loading = false;
    },
    plusClickHandler(uid) {
      this.emitToParent("clickedRef", uid);
    },
    async getReferences() {
      // TODO create a smarter system for dealing with 404s
      let error = false;
      const responseArray = await Promise.all(
        [...this.uids].map(async (elem) => {
          try {
            const response = await this.$api.get(
              `${this.$references_url}/${elem}`
            );
            return response.data;
          } catch (e) {
            console.log(e);
            error = true;
            return {
              reference: "ERROR LOADING REFERENCE",
              doi_url: "",
              error: true,
              uid: "NOT_FOUND",
            };
          }
        })
      );
      this.errorLoadingRefs = error;
      return responseArray;
    },
    async emitToParent(eventName, data) {
      // This emits an object with the altered data section, the index, and
      // a callback for the parent component to call with a boolean as the argument,
      // so that this component can know whether not the data was saved succesfully
      // if the data was succesfully saved then the code will execute as normal.
      // if not then this function will throw an error
      // Partly inspired by how this programmer awaits a settimeout https://stackoverflow.com/a/51939030/8903570
      return new Promise((resolve, reject) =>
        this.$emit(eventName, {
          data,
          callback: (success) => {
            if (success) {
              resolve();
            } else {
              reject();
            }
          },
        })
      );
    },
    async emitEdit(indexChanged, originalSection) {
      try {
      } catch (error) {
        this.sections[indexChanged] = originalSection;
        this.saving = false;
        this.couldNotSave = true;
      }
    },
    async addReference(eventObj) {
      this.uids.push(eventObj.data.uid);
      this.saving = true;
      try {
        await this.emitToParent("dataToParent", this.uids);
        this.references.push(eventObj.data);
        this.saving = false;
        eventObj.callback(true);
      } catch (e) {
        this.uids.pop();
        this.saving = false;
        this.couldNotSave = true;
        eventObj.callback(false);
        console.log(e);
      }
    },
    async removeReference(index) {
      if (!Number.isInteger(index)) {
        throw Error("Index should be integer");
      }

      this.saving = true;
      const uid = this.uids[index];
      try {
        // delete from array without leaving a hole
        this.uids.splice(index, 1);
        await this.emitToParent("dataToParent", this.uids);
        this.references.splice(index, 1);
        this.saving = false;
      } catch (error) {
        this.uids.splice(index, 0, uid);
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
      }
    },
    showRemoveConfirmation(index) {
      this.$bvModal
        .msgBoxConfirm(
          "Are you sure you want to remove this reference? (You can add it back in later)",
          {
            title: "Please Confirm",
            size: "sm",
            buttonSize: "sm",
            okVariant: "danger",
            okTitle: "YES",
            cancelTitle: "NO",
            footerClass: "p-2",
            hideHeaderClose: false,
            centered: true,
          }
        )
        .then((value) => {
          if (value) {
            this.removeReference(index);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    deleteIfNew(index, section) {
      if (section[this.titleKey] === "" && section[this.textKey] === "") {
        // delete from array without leaving a hole
        this.sections.splice(index, 1);
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
    "b-icon-x": BIconX,
    "b-icon-plus": BIconPlus,
    "mongo-search": MongoSearch,
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
.text-red {
  color: red;
}

.active {
  background-color: yellowgreen;
}
</style>
