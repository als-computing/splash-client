<template>
  <b-table :hover="true" small :items="items" :fields="fields" responsive="sm">
    <template #cell(citation_html)="data">
      <span v-html="data.value"></span>
    </template>
    <template #cell(insert)="data">
      <b-button variant="link">
      <b-icon-plus
        @click="
          plusClickHandler(
            items[data.index].inTextCitation,
            items[data.index].uid,
            items[data.index].citation_html
          )
        "
      />
      </b-button>
    </template>
  </b-table>
</template>

<script>
import { BIconPlus } from 'bootstrap-vue';
import referenceUtils from '../referenceUtils';

export default {
  props: {
    referenceList: Array,
    alreadyFoundButtonText: {
      type: String,
      default: 'Insert',
    },
  },
  data() {
    return {
      fields: [{ key: 'citation_html', label: 'Citation' }, { key: 'insert', label: '' }],
    };
  },
  computed: {
    items() {
      return this.referenceList.map((elem) => ({
        inTextCitation: referenceUtils.generateInTextCitation(elem),
        citation_html: referenceUtils.generateHtmlCitation(elem),
        uid: elem.uid,
      }));
    },
  },
  methods: {
    plusClickHandler(inTextCitation, uid, html) {
      this.$emit('clickedRef', inTextCitation, uid, html);
    },
  },
  components: {
    BIconPlus,
  },
};
</script>
