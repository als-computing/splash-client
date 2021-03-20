<template>
  <div class="page">
    <b-container>
      <b-row>
        <error-card v-if="couldNotRetrieve" />
      </b-row>
    </b-container>
    <b-modal
      v-model="couldNotSaveTitle"
      :static="true"
      v-b-modal.modal-center
      ok-only
      >Couldn't perform action. Try again or check your internet
      connection.</b-modal
    >
    <div v-if="ready === true">
      <b-container fluid>
        <b-row align-h="end">
          <b-col lg="4" align-self="end">
            <edit-title
            :title="pageDoc.data.title"
            @toggle-editing="editing_title = $event"
            @dataToParent="updateDatabase('', 'title', arguments[0])"
            :read-only="editing_content || editing_references || editing_title"/>
             <b-button :to="$route.path + '/v/'"
              >View past versions</b-button
            >
          </b-col>
          <b-col lg="4" align-self="end">
            <meta-data :splash-md="pageDoc.data.splash_md" class="ml-lg-5 mt-3"/>
          </b-col>
        </b-row>
     </b-container>
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
                :read-only="editing_content || editing_references || editing_title"
              />
            </b-col>
            <b-col lg="9">
              <edit-content
                @toggle-editing="editing_content = $event"
                :read-only="editing_fields || editing_references || editing_title"
                :documentation="pageDoc.data.documentation"
                @dataToParent="
                  updateDatabase('', 'documentation', arguments[0])
                "
              />
              <additional-references
                @toggle-editing="editing_references = $event"
                :references-array="pageDoc.data.references"
                :read-only="editing_fields || editing_content || editing_title"
                @dataToParent="updateDatabase('', 'references', arguments[0])"
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
import EditTitle from '@/components/editor/EditTitle.vue';
import ErrorCard from '../components/ErrorCard.vue';
import AdditionalReferences from '../components/editor/AdditionalReferences.vue';
import MetaData from '../components/editor/MetaData.vue';

export default {
  components: {
    EditTitle,
    ErrorCard,
    EditContent,
    EditFields,
    AdditionalReferences,
    MetaData,
  },
  data() {
    return {
      pageDoc: {},
      couldNotRetrieve: false,
      ready: false,
      editing_fields: false,
      editing_content: false,
      editing_references: false,
      editing_title: false,
      couldNotSaveTitle: false,
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
