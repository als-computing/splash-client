<template>
  <div class="compound">
    <b-modal v-model="couldNotRetrieve" v-b-modal.modal-center ok-only
      >We couldn't retrieve the document. Check the url or your internet
      connection and reload.</b-modal
    >
    <div v-if="mounted">
      <h1>{{ compoundDoc.data.species }}</h1>
      <b-jumbotron>
        <b-container fluid>
          <b-row>
            <b-col lg="3">
              <edit-documentation
                :sections-array="compoundDoc.data.metadata"
                :markdown="false"
                @dataToParent="updateDatabase('', 'metadata', arguments[0])"
              />
            </b-col>
            <b-col lg="9">
              <edit-documentation
                :sections-array="compoundDoc.data.documentation.sections"
                :markdown="true"
                @dataToParent="updateDatabase('documentation', 'sections', arguments[0])"
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
import EditDocumentation from '@/components/editor/EditDocumentation.vue';

export default {
  data() {
    return {
      compoundDoc: {},
      couldNotRetrieve: false,
      mounted: false,
    };
  },

  async mounted() {
    const compoundDoc = new DocumentUpdater(
      this.$compounds_url,
      this.$route.params.uid,
    );
    try {
      await compoundDoc.init();
      this.compoundDoc = compoundDoc;
      this.mounted = true;
    } catch (e) {
      console.log('line 39');
      console.log(e);
      this.couldNotRetrieve = true;
    }
  },

  methods: {
    async updateDatabase(path, key, eventObj) {
      try {
        await this.compoundDoc.updateDataProperty(
          path,
          key,
          eventObj.sections,
        );
        eventObj.callback(true);
      } catch (error) {
        eventObj.callback(false);
        console.log(error);
      }
    },
  },
  components: {
    'edit-documentation': EditDocumentation,
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
