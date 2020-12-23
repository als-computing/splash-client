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
    <div v-if="mounted">
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
</template>

<script>
import DocumentUpdater from '@/components/editor/DocumentUpdater';
import EditContent from '@/components/editor/EditContent.vue';

export default {
  data() {
    return {
      pageDoc: {},
      couldNotRetrieve: false,
      mounted: false,
    };
  },

  async mounted() {
    const pageDoc = new DocumentUpdater(
      this.$pages_url,
      this.$route.params.uid,
    );
    try {
      await pageDoc.init();
      this.pageDoc = pageDoc;
      this.mounted = true;
    } catch (e) {
      console.log(e);
      this.couldNotRetrieve = true;
    }
  },

  methods: {
    async updateDatabase(path, key, eventObj) {
      try {
        await this.pageDoc.updateDataProperty(path, key, eventObj.data);
        eventObj.callback(true);
      } catch (error) {
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
