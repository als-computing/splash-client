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
    <b-button :to="this.$route.path+'?version='+pageDoc.data.document_version" v-if="!view_version" class="m-3">View past versions</b-button>
    <b-button :to="this.$route.path" class="m-3" v-if="view_version">Go back to editing</b-button>
      <div>
        <h1>{{ pageDoc.data.title }}</h1>
        <b-pagination-nav :link-gen="linkGen" :number-of-pages="numVersions" use-router v-if="view_version" align="center"></b-pagination-nav>
        <b-jumbotron>
          <b-container fluid>
            <b-row>
              <b-col lg="3">
                <edit-content
                  v-if="view_version"
                  :sections-array="pageDoc.data.metadata"
                  :read-only="true"
                  :key="'edit-content1'+version"
                  empty-message="No fields in this version."
                />
                <edit-content
                  v-if="!view_version"
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
                  v-if="view_version"
                  :sections-array="pageDoc.data.documentation.sections"
                  :read-only="true"
                  :markdown="true"
                  :key="'edit-content2'+version"
                  empty-message="No documentation in this version."
                />
                <edit-content
                  v-if="!view_version"
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
      view_version: false,
      // This condition is to make sure
      // that we don't send another request before the first one is finished
      // so that we don't accidentally overwrite data
      lockSave: false,
      numVersions: undefined,
      version: undefined,
    };
  },
  computed: {
  },
  watch: {
    // Whenever the route query changes this will execute,
    // It is essentially like running code in the mount function,
    // except this time it will react to url changes
    '$route.query': {
      handler() {
        this.fetchPageData();
      },
      immediate: true,
    },
  },
  /* async mounted() {
    await this.fetchPageData();
  }, */
  methods: {
    waitFor(conditionFunction) {
      const poll = (resolve) => {
        if (conditionFunction()) resolve();
        else setTimeout(() => poll(resolve), 100);
      };

      return new Promise(poll);
    },
    linkGen(pageNum) {
      return `?version=${pageNum}`;
    },
    async fetchPageData() {
      // If the router has the query parameter version, then
      // we will validate it. If it is invalid we just take the version query out from the URL
      // altogether.
      if (
        Object.prototype.hasOwnProperty.call(this.$route.query, 'version')
        && (!Number.isInteger(Number(this.$route.query.version))
          || Number(this.$route.query.version) <= 0)
      ) {
        this.$router.replace({
          path: this.$route.path,
        });
        return;
      }
      let pageDoc = {};

      // If we haven't already retrieved the number of versions,
      // then do so
      if (this.numVersions === undefined) {
        try {
          pageDoc = new PageUpdater(
            this.$pages_url,
            this.$route.params.uid,
          );
          await pageDoc.init();
          this.numVersions = pageDoc.data.document_version;
        } catch (e) {
          console.log(e);
          this.couldNotRetrieve = true;
        }
        // If the version is not specified, set pageDoc data property to the current pageDoc
        // and set view_version to false, this if statement prevents a duplicate request
        if (this.$route.query.version === undefined) {
          this.pageDoc = pageDoc;
          this.ready = true;
          this.view_version = false;
          this.version = this.$route.query.version;
          return;
        }
        // if the number of versions is equal to the specified versions do the same as above
        // but set view_version to true, this if statement prevents a duplicate request
        if (this.numVersions === Number(this.$route.query.version)) {
          this.pageDoc = pageDoc;
          this.ready = true;
          this.view_version = true;
          this.version = this.$route.query.version;
          return;
        }
      }

      // If the version query param exists then get the specific version
      if (Object.prototype.hasOwnProperty.call(this.$route.query, 'version')) {
        pageDoc = new PageUpdater(
          this.$pages_url,
          this.$route.params.uid,
          Number(this.$route.query.version),
        );

        this.view_version = true;
      } else {
        this.view_version = false;
        pageDoc = new PageUpdater(this.$pages_url, this.$route.params.uid);
      }
      try {
        await pageDoc.init();
        this.pageDoc = pageDoc;
        this.ready = true;
        this.version = this.$route.query.version;
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
        eventObj.callback(true);
      } catch (error) {
        this.lockSave = false;
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
