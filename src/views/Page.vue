<template>
  <div class="page">
    <b-container>
      <b-row>
        <b-col>
        <error-card v-if="errorCard.couldNotRetrieve" />
        <error-card
          v-if="errorCard.notFound"
          error-msg="Oops! Looks like this page doesn't exist."
          :showReloadText="false"
          :show-return-to-msg='true'
          />
        <error-card
          v-if="errorCard.deleted"
          error-msg="This page has been deleted."
          :showReloadText="false"
          :show-return-to-msg='true'
          />
        </b-col>
      </b-row>
    </b-container>

    <force-confirmation-modal
      v-model='modal.EtagErr'
      ok-button-label='See their changes'
      main-message='Someone changed this document while you were editing.'
      @ok-click='openWindow(); $event.closeModal();'/>

    <force-confirmation-modal
      v-model='modal.alreadyDeleted'
      main-message='This page was already deleted.'
      @ok-click='$router.replace("/compounds"); $event.closeModal();'/>

    <force-confirmation-modal v-model='modal.updatedBeforeDelete'
      main-message='This page has been updated.'
      ok-button-label='See the most recent version'
      @ok-click='$router.go(); $event.closeModal();'/>

    <force-confirmation-modal v-model='modal.deletedBeforeUpdate'
      main-message='This page has been deleted. No edits can be made to it.'
      @ok-click='$event.closeModal()'/>

    <div v-if="ready === true">
      <b-container fluid>
        <b-row align-h="end">
          <b-col lg="4" align-self="end">
            <b-button variant="danger" size="lg" v-if='!readOnly' :disabled="editing_content || editing_content || editing_title || Boolean(newEtag)" @click="callOnDeleteButton()">Delete</b-button>
            <span v-if='hasBeenDeleted'><h5>This document has been deleted. Return to <b-link to='/'>Home</b-link>.</h5></span>
          </b-col>
          <b-col lg="4" align-self="end">
            <edit-title
            :title="pageDoc.data.title"
            @toggle-editing="editing_title = $event"
            @dataToParent="updateDatabase('', 'title', arguments[0])"
            :read-only="editing_content || editing_references || editing_title || readOnly"/>
               <b-button v-if="newEtag !== undefined" @click="openWindow(); ok();">View changes</b-button>
          </b-col>
          <b-col lg="4" align-self="end">
            <meta-data :splash-md="pageDoc.data.splash_md" :past-versions-btn='viewPastVersionsButton' class="ml-lg-5 mt-3"/>
          </b-col>
        </b-row>
     </b-container>
      <b-jumbotron>
        <b-container fluid>
          <b-row>
            <b-col>
              <edit-content
                @toggle-editing="editing_content = $event"
                :read-only="editing_references || editing_title || readOnly"
                :documentation="pageDoc.data.documentation"
                @dataToParent="
                  callOnDataEmit('', 'documentation', arguments[0])
                "
              />
              <additional-references
                @toggle-editing="editing_references = $event"
                :references-array="pageDoc.data.references"
                :read-only="editing_content || editing_title || readOnly"
                @dataToParent="callOnDataEmit('', 'references', arguments[0])"
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
import EditTitle from '@/components/editor/EditTitle.vue';
import ErrorCard from '@/components/utils/ErrorCard.vue';
import AdditionalReferences from '@/components/editor/AdditionalReferences.vue';
import MetaData from '@/components/editor/MetaData.vue';
import ForceConfirmationModal from '@/components/utils/ForceConfirmationModal.vue';

export default {
  components: {
    EditTitle,
    ErrorCard,
    EditContent,
    AdditionalReferences,
    MetaData,
    ForceConfirmationModal,
  },
  data() {
    return {
      pageDoc: {},
      errorCard: { couldNotRetrieve: false, notFound: false, deleted: false },

      modal: {
        EtagErr: false,
        alreadyDeleted: false,
        updatedBeforeDelete: false,
        deletedBeforeUpdate: false,
      },
      hasBeenDeleted: false,

      ready: false,
      editing_content: false,
      editing_references: false,
      editing_title: false,
      openedWindow: { closed: true },
      newEtag: undefined,
      readOnly: false,
      viewPastVersionsButton: true,
    };
  },
  mounted() {
    if (this.$route.name === 'page-view') {
      this.readOnly = true;
      this.viewPastVersionsButton = false;
    }
    this.fetchPageData();
  },
  methods: {
    async fetchPageData() {
      const pageDoc = new PageUpdater(this.$pages_url, this.$route.params.uid);
      try {
        await pageDoc.init();
        this.pageDoc = pageDoc;
        if (pageDoc.data.splash_md.archived === true) {
          this.errorCard.deleted = true;
          return;
        }
        this.ready = true;
      } catch (e) {
        console.log(e);
        if (e.response.status === 404) {
          this.errorCard.notFound = true;
          return;
        }
        this.errorCard.couldNotRetrieve = true;
      }
    },
    async callOnDataEmit(path, key, eventObj) {
      if (this.newEtag !== undefined) {
        const value = await this.$bvModal.msgBoxConfirm(
          'Are sure you have succesfully merged the two documents?',
          { okTitle: 'YES', cancelTitle: 'NO' },
        );
        if (value === true) {
          this.updateDatabase(path, key, eventObj, this.newEtag);
          this.closeWindow();
        } else {
          eventObj.callback({ success: false, displayMessage: false });
        }
      } else {
        this.updateDatabase(path, key, eventObj);
      }
    },
    async callOnDeleteButton() {
      const messageNode = this.$createElement('h4', 'Are sure you want to delete this document? This is irreversible.');
      const value = await this.$bvModal.msgBoxConfirm(
        messageNode,
        { okTitle: 'YES', cancelTitle: 'NO', okVariant: 'danger' },
      );
      if (value === true) {
        this.archive();
      }
    },
    async updateDatabase(path, key, eventObj, etag) {
      try {
        await this.pageDoc.updateDataProperty(path, key, eventObj.data, etag);
        this.newEtag = undefined;
        // This tells the component that emitted this event
        // that the update was successful
        eventObj.callback({ success: true });
      } catch (error) {
        console.log(error);
        if (error.response.status === 412 && error.response.data.err === 'etag_mismatch_error') {
          if (error.response.data.splash_md.archived === true) {
            eventObj.callback({ success: false, displayMessage: false });
            this.explainDeleted();
            return;
          }
          this.newEtag = error.response.data.etag;
          // We set displayMessage here to false so that we can display our own error message
          // instead of the sub component displaying something
          eventObj.callback({ success: false, displayMessage: false });
          this.modal.EtagErr = true;
          return;
        }
        // This tells the component that emitted this event
        // that the update failed
        eventObj.callback({ success: false, displayMessage: true });
      }
    },
    explainDeleted() {
      this.modal.deletedBeforeUpdate = true;
      this.readOnly = true;
      this.hasBeenDeleted = true;
    },
    async archive() {
      try {
        await this.pageDoc.archiveAction('archive', this.newEtag);
        this.$router.replace('/compounds');
        return;
      } catch (error) {
        console.log(error);
        if (error.response.status === 409) {
          this.modal.alreadyDeleted = true;
        } else if (error.response.status === 412) {
          this.modal.updatedBeforeDelete = true;
        }
      }
    },
    closeWindow() {
      this.openedWindow.close();
    },
    openWindow() {
      if (this.openedWindow.closed !== true) {
        this.closeWindow();
      }
      this.openedWindow = window.open(
        `${this.$route.params.uid}/view?hideNavbar=true`,
        '',
        'location=no',
      );
    },
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
