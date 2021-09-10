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
       <b-container fluid>
        <b-row align-h="end">
          <b-col lg="4" align-self="end" class>
       <h1>{{ pageDoc.data.title }}</h1>
        <b-button :to="`/pages/${$route.params.uid}`"
                >Go back to editing</b-button
              >
              <b-pagination-nav
                align="center"
                class="my-1"
                :link-gen="linkGen"
                :number-of-pages="numVersions"
                use-router
              ></b-pagination-nav>
       </b-col>
       <b-col lg="4" align-self="end">
         <meta-data :splash-md="pageDoc.data.splash_md" :past-versions-btn='false' class="ml-lg-5"/>
          </b-col>
        </b-row>
     </b-container>
        <b-jumbotron>
          <b-container fluid>
            <b-row>
              <b-col>
                <edit-content
                  :documentation="pageDoc.data.documentation"
                  :read-only="true"
                  :key="'edit-content2' + version"
                />
                <additional-references
                  :read-only="true"
                  :references-array="pageDoc.data.references"
                  :key="'edit-content3' + version"
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
import AdditionalReferences from '@/components/references/AdditionalReferences.vue';
import MetaData from '@/components/editor/MetaData.vue';

export default {
  data() {
    return {
      pageDoc: {},
      couldNotRetrieve: false,
      ready: false,
      numVersions: undefined,
      version: undefined,
      creatorName: '-',
      editorName: '',
    };
  },
  // This is only called when we first navigate to the component
  mounted() {
    this.initialize();
  },

  // This is only called when the route for this component is UPDATED,
  // This is not called when we first navigate to this component
  // https://router.vuejs.org/guide/advanced/navigation-guards.html#in-component-guards
  async beforeRouteUpdate(to, from, next) {
    this.initialize();
    next();
  },
  methods: {
    linkGen(pageNum) {
      return {
        name: 'page-versions',
        params: { version: pageNum },
      };
    },
    validateRoute() {
      if (
        !Number.isInteger(
          Number(this.$route.params.version) || Number(this.$route.params.version) <= 0,
        )
      ) {
        return false;
      }
      return true;
    },
    async initialize() {
      console.log('intitialize');
      try {
        const response = await this.$api.get(
          `${this.$pages_url}/num_versions/${this.$route.params.uid}`,
        );
        this.numVersions = response.data.number;
      } catch (e) {
        this.couldNotRetrieve = true;
        return;
      }
      if (this.validateRoute() === false) {
        this.$router.replace({
          path: `/pages/${this.$route.params.uid}/v/${this.numVersions}`,
        });
        return;
      }
      this.fetchPageData();
    },
    async fetchPageData() {
      const pageDoc = new PageUpdater(
        this.$pages_url,
        this.$route.params.uid,
        Number(this.$route.params.version),
      );
      try {
        await pageDoc.init();
        this.pageDoc = pageDoc;
        this.ready = true;
        this.version = this.$route.params.version;
      } catch (e) {
        console.log(e);
        this.couldNotRetrieve = true;
      }
    },
  },
  components: {
    'edit-content': EditContent,
    AdditionalReferences,
    MetaData,
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
