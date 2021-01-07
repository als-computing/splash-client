<template>
  <div class="page">
    <b-modal
      v-model="couldNotRetrieve"
      :static="true"
      v-b-modal.modal-center
      ok-only
      >We couldn't retrieve the document. Check the url or your internet
      connection and reload.</b-modal
    >

    <div v-if="ready">
      <b-button
        :to="$route.path + '/v/'"
        class="m-3"
        >View past versions</b-button
      >
      <div>
        <h1>{{ pageDoc.data.title }}</h1>
        <b-jumbotron>
          <b-container fluid>
            <b-row>
              <b-col lg="3">
                <edit-content
                  :sections-array="pageDoc.data.metadata"
                  :markdown="false"
                  empty-message="No fields found. Be the first to add some."
                  remove-button-text="Delete field"
                  add-button-text="Add field"
                  title-input-name="Name"
                  value-input-name="Value"
                  delete-confirmation-message="Are you sure you want to delete this field? This can't be undone."
                  @dataToParent="updateDatabase('', 'metadata', arguments[0])"
                />
              </b-col>
              <b-col lg="9">
                <edit-content
                  :sections-array="pageDoc.data.documentation.sections"
                  :markdown="true"
                  empty-message="No documentation found. Be the first to add some."
                  remove-button-text="Delete section"
                  add-button-text="Add section"
                  title-input-name="Title"
                  value-input-name="Documentation"
                  delete-confirmation-message="Are you sure you want to delete this section? This can't be undone."
                  @dataToParent="
                    updateDatabase('documentation', 'sections', arguments[0])
                  "
                />
              </b-col>
            </b-row>
          </b-container>
        </b-jumbotron>
      </div>
    </div>
  </div>
</template>

<script>
import PageUpdater from '@/components/editor/PageUpdater';
import EditContent from '@/components/editor/EditContent.vue';

export default {
  data() {
    return {
      pageDoc: {},
      couldNotRetrieve: false,
      ready: false,
      // This condition is to make sure
      // that we don't send another request before the first one is finished
      // so that we don't accidentally overwrite data
      lockSave: false,
    };
  },
  mounted() {
    this.fetchPageData();
  },
  methods: {
    // This waits for a condition to be true
    // before finishing execution
    waitFor(conditionFunction) {
      const poll = (resolve) => {
        if (conditionFunction()) resolve();
        else setTimeout(() => poll(resolve), 100);
      };

      return new Promise(poll);
    },
    async fetchPageData() {
      const pageDoc = new PageUpdater(this.$pages_url, this.$route.params.uid);
      try {
        await pageDoc.init();
        this.pageDoc = pageDoc;
        this.ready = true;
      } catch (e) {
        console.log(e);
        this.couldNotRetrieve = true;
      }
    },
    async updateDatabase(path, key, eventObj) {
      // Don't send off the request until all other requests are done
      await this.waitFor(() => this.lockSave === false);
      this.lockSave = true;
      try {
        await this.pageDoc.updateDataProperty(path, key, eventObj.data);
        this.lockSave = false;

        // This tells the component that emitted this event
        // that the update was successful
        eventObj.callback(true);
      } catch (error) {
        this.lockSave = false;
        // This tells the component that emitted this event
        // that the update failed
        eventObj.callback(false);
        console.log(error);
      }
    },
  },
  components: {
    'edit-content': EditContent,
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
