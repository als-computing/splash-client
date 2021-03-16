<template>
  <div class="page">
    <b-container>
      <b-row>
        <error-card v-if="couldNotRetrieve" />
      </b-row>
    </b-container>

    <div v-if="ready">
      <b-button :to="$route.path + '/v/'" class="m-3"
        >View past versions</b-button
      >
      <div>
        <h1>{{ pageDoc.data.title }}</h1>
        <b-jumbotron>
          <b-container fluid>
            <b-row>
              <b-col lg="3">
                <edit-fields
                  @toggle-editing="editing_fields = $event"
                  :sections-array="pageDoc.data.metadata"
                  :markdown="false"
                  empty-message="No fields found. Be the first to add some."
                  remove-button-text="Delete field"
                  add-button-text="Add field"
                  title-input-name="Name"
                  value-input-name="Value"
                  delete-confirmation-message="Are you sure you want to delete this field? This can't be undone."
                  @dataToParent="updateDatabase('', 'metadata', arguments[0])"
                  :read-only="editing_content || editing_references"
                />
              </b-col>
              <b-col lg="9">
                <edit-content
                  @toggle-editing="editing_content = $event"
                  :read-only="editing_fields || editing_references"
                  :documentation="pageDoc.data.documentation"
                  @dataToParent="
                    updateDatabase('', 'documentation', arguments[0])
                  "
                />
                <additional-references
                  @toggle-editing="editing_references = $event"
                  :references-array="pageDoc.data.references"
                  :read-only="editing_fields || editing_content"
                  @dataToParent=" updateDatabase('', 'references', arguments[0])"
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
import EditFields from '@/components/editor/EditFields.vue';
import ErrorCard from '../components/ErrorCard.vue';
import AdditionalReferences from '../components/editor/AdditionalReferences.vue';

export default {
  components: {
    ErrorCard,
    EditContent,
    EditFields,
    AdditionalReferences,
  },
  data() {
    return {
      pageDoc: {},
      couldNotRetrieve: false,
      ready: false,
      editing_fields: false,
      editing_content: false,
      editing_references: false,
    };
  },
  mounted() {
    this.fetchPageData();
  },
  methods: {
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
      try {
        await this.pageDoc.updateDataProperty(path, key, eventObj.data);

        // This tells the component that emitted this event
        // that the update was successful
        eventObj.callback(true);
      } catch (error) {
        // This tells the component that emitted this event
        // that the update failed
        eventObj.callback(false);
        console.log(error);
      }
    },
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
