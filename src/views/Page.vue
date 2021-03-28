<template>
  <div class="page">
   <error-card v-if="couldNotRetrieve"/>
    <div v-if="ready">
       <b-container fluid>
        <b-row align-h="end">
          <b-col lg="4" align-self="end" class>
       <h1>{{ pageDoc.data.title }}</h1>
       </b-col>
       <b-col lg="4" align-self="end">
         <meta-data :splash-md="pageDoc.data.splash_md" class="ml-lg-5"/>
          </b-col>
        </b-row>
     </b-container>
        <b-jumbotron>
          <b-container fluid>
            <b-row>
              <b-col lg="3">
                <edit-fields
                  :sections-array="pageDoc.data.metadata"
                  :read-only="true"
                  :key="'edit-content1' + version"
                  empty-message="No fields in this version."
                />
              </b-col>
              <b-col lg="9">
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
import AdditionalReferences from '@/components/editor/AdditionalReferences.vue';
import MetaData from '@/components/editor/MetaData.vue';
import EditFields from '../components/editor/EditFields.vue';
import ErrorCard from '../components/ErrorCard.vue';

export default {
  data() {
    return {
      pageDoc: {},
      couldNotRetrieve: false,
      ready: false,
      creatorName: '-',
      editorName: '',
    };
  },
  // This is only called when we first navigate to the component
  mounted() {
    this.fetchPageData();
  },
  methods: {
    async fetchPageData() {
      const pageDoc = new PageUpdater(
        this.$pages_url,
        this.$route.params.uid,
      );
      try {
        await pageDoc.init();
        this.pageDoc = pageDoc;
        this.ready = true;
      } catch (e) {
        console.log(e);
        this.couldNotRetrieve = true;
      }
    },
  },
  components: {
    'edit-content': EditContent,
    EditFields,
    AdditionalReferences,
    MetaData,
    ErrorCard,
  },
};

</script>
