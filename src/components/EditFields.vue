<template>
  <div class="documentation_page" v-if="mounted">
    <b-jumbotron>
      <b-container fluid>
        <b-row>
            <b-col
              v-for="(area, area_index) in field_arrays"
              :key="area_index"
              :lg="`${columnSizes[area_index]}`"
            >
              <b-card>
                <div align="left">
                  <b-button
                    @click="addRow(area_index, 0)"
                    :disabled="currently_edited_row !== undefined"
                  >Add row</b-button>
                </div>
                <h4
                  v-if="field_arrays[area_index].length === 0"
                >No documentation here. Be the first to add some!</h4>
                <div v-if="field_arrays[area_index].length !== 0">
                  <!--This part iterates over the rows and displays them-->

                  <!--Using the row_index as the key is bad practice here, If were moving
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
                    v-for="(row, row_index) in field_arrays[area_index]"
                    :key="row_index"
                  >
                    <!--This displays each row of the documentation-->
                    <div @dblclick="edit(area_index, row_index, row.text, row.title)">
                      <div
                        v-show="(row_index !== currently_edited_row) || (area_index !== currently_edited_area)"
                      >
                        <p>
                          <strong>{{row.title}}</strong>
                          <span
                            class="pointer"
                            @click="edit(area_index, row_index, row.text, row.title)"
                          >
                            <u>[edit]</u>
                          </span>
                          <span class="text-muted" style="font-size:0.8rem">(or double click)</span>
                        </p>
                        <!--This parses the markdown and displays it-->
                        <div class="markdown-html" v-html="parseMarkdown(row.text)" />
                      </div>

                      <!--This appears when we want to edit the documentation-->
                      <div
                        v-if="(row_index === currently_edited_row) && (area_index === currently_edited_area)"
                      >
                        <b-form-input v-model="edited_data.title" :readonly="saving" />
                        <b-form-textarea
                          v-model="edited_data.text"
                          max-rows="100"
                          :readonly="saving"
                        />
                        <b-button-toolbar>
                          <!--The save button is disabled when the boxes are empty, are not changed, or if the app is in the process of saving-->
                          <b-button
                            variant="primary"
                            @click="saveEdit(row)"
                            :disabled=" (edited_data.title === '' || edited_data.text === '') || (((edited_data.title === row.title) && (edited_data.text === row.text)) || saving)"
                          >Save</b-button>

                          <!--The cancel button is disabled when the app is in the process of saving-->
                          <b-button
                            variant="danger"
                            @click="removeFocus(); deleteIfNew(area_index, row_index, row)"
                            :disabled="saving === true"
                          >Cancel</b-button>

                          <!--The Delete row button is hidden when the row.title
                        or row.text is empty (implying that this is a brand new row)
                          and when the app is in the process of saving-->
                          <b-button
                            variant="warning"
                            @click="showDeleteConfirmation(area_index, row_index)"
                            v-show="!(row.title === '' || row.text === '') && !saving"
                          >Delete row</b-button>

                          <b-spinner v-show="(saving === true)" />
                        </b-button-toolbar>
                      </div>
                    </div>

                    <!--Add row is disabled if a row is being edited.
                    It is only shown for rows that are not being edited-->
                    <b-button
                      :disabled="currently_edited_row !== undefined"
                      v-show="! ((currently_edited_row === row_index) && (currently_edited_area === area_index))"
                      @click="addRow(area_index, row_index+1)"
                    >Add row</b-button>

                    <b-modal
                      v-model="couldNotSave"
                      v-b-modal.modal-center
                      ok-only
                    >We couldn't save. Check your internet connection and try again. If the problem persists, contact the administrator.</b-modal>
                    <hr v-show="row_index+1 !== field_arrays[area_index].length" />
                  </div>
                </div>
              </b-card>
            </b-col>
        </b-row>
      </b-container>
    </b-jumbotron>
  </div>
</template>

<script>
// import ExperimentLineChart from '@/components/ExperimentLineChart.vue';
import utils from "@/utils";

export default {
  name: "EditFields",
  props: {
    endpoint: String,
    uid: String,
    pathArrays: Array,
    // This defines the bootstrap column size we want for
    // the different editing areas, 1st value corresponds to
    // 1st editing area, second to second area, etc.
    columnSizes: Array,
  },
  data() {
    return {
      field_arrays: [],
      currently_edited_area: undefined,
      currently_edited_row: undefined,
      data: {},
      edited_data: {
        title: "",
        text: "",
      },
      saving: false,
      couldNotSave: false,
      somethingWentWrong: true,
      mounted: false,
    };
  },
  async mounted() {
    try {
      const response = await this.$api.get(`${this.endpoint}/${this.uid}`);

      this.data = response.data;

      // Give the data to the parent component
      this.$emit("dataToParent", this.data);

      this.pathArrays.forEach((elem) => {
        const fieldArray = this.getArrayFromKeys(elem, this.data);
        this.field_arrays.push(fieldArray);
      });
      this.mounted = true;

      // console.log('mounted');
    } catch (e) {
      this.somethingWentWrong = true;
      console.log(e);
    }
    // this.open_experiment = response.data.experiments[0];
  },
  methods: {
    getArrayFromKeys(keys, data) {
      let array = data;
      keys.forEach((key) => {
        array = array[key];
        if (array === undefined || array === null) {
          throw Error(
            "Prop: 'path-to-fields' leads to undefined property in data."
          );
        }
      });
      if (!Array.isArray(array)) {
        throw TypeError(
          "The property specified by prop: 'path-to-fields' must be an array"
        );
      }
      return array;
    },
    async removeFocus() {
      this.currently_edited_area = undefined;
      this.currently_edited_row = undefined;
      this.edited_data.text = "";
      this.edited_data.title = "";
    },
    async saveEdit(originalRow) {
      try {
        this.saving = true;
        this.field_arrays[this.currently_edited_area][
          this.currently_edited_row
        ] = {
          title: this.edited_data.title,
          text: this.edited_data.text,
        };
        await this.updateDatabase();
        this.removeFocus();
        this.saving = false;
      } catch (error) {
        this.field_arrays[this.currently_edited_area][
          this.currently_edited_row
        ] = originalRow;
        this.saving = false;
        this.couldNotSave = true;
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error);
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(error);
          console.log("Error", error.message);
        }
      }
    },
    async updateDatabase() {
      const { uid } = this.data;
      delete this.data.uid;
      await this.$api.put(`${this.endpoint}/${this.uid}`, this.data);
      this.data.uid = uid;
    },
    addRow(areaIndex, rowIndex) {
      if (!Number.isInteger(areaIndex)) {
        throw Error("1st positional argument should be integer");
      }
      if (!Number.isInteger(rowIndex)) {
        throw Error("2nd positional argument should be integer");
      }
      const blankRow = {
        title: "",
        text: "",
      };
      this.field_arrays[areaIndex].splice(rowIndex, 0, blankRow);
      this.edit(areaIndex, rowIndex, blankRow.title, blankRow.text);
    },
    async deleteRow(areaIndex, rowIndex) {
      if (!Number.isInteger(areaIndex)) {
        throw Error("1st positional argument should be integer");
      }
      if (!Number.isInteger(rowIndex)) {
        throw Error("2nd positional argument should be integer");
      }

      this.saving = true;
      const row = this.field_arrays[areaIndex][rowIndex];
      try {
        // delete from array without leaving a hole
        this.field_arrays[areaIndex].splice(rowIndex, 1);
        await this.updateDatabase();
        this.removeFocus();
        this.saving = false;
      } catch (error) {
        this.field_arrays[areaIndex].splice(rowIndex, 0, row);
        this.saving = false;
        this.couldNotSave = true;
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error);
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(error);
          console.log("Error", error.message);
        }
      }
    },
    edit(areaIndex, rowIndex, text, title) {
      if (this.saving) {
        return;
      }
      if (
        rowIndex !== this.currently_edited_row ||
        areaIndex !== this.currently_edited_area
      ) {
        this.currently_edited_area = areaIndex;
        this.currently_edited_row = rowIndex;
        this.edited_data.text = text;
        this.edited_data.title = title;
      }
    },
    showDeleteConfirmation(areaIndex, rowIndex) {
      this.$bvModal
        .msgBoxConfirm(
          "Are you sure you want to delete this row? This can't be undone.",
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
            this.deleteRow(areaIndex, rowIndex);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    deleteIfNew(areaIndex, rowIndex, row) {
      if (row.title === "" && row.text === "") {
        // delete from array without leaving a hole
        this.field_arrays[areaIndex].splice(rowIndex, 1);
      }
    },
    parseMarkdown(text) {
      return utils.parseMarkDown(text);
    },
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
