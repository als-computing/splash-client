<template>
  <b-table
    :hover="true"
    small
    :fields="tableFields"
    :items="references"
    responsive="sm"
    v-if="referencesArray.length !== 0 && !loading"
  >
    <template #cell(reference)="data">
      <a
        :name="data.item.uid"
        :class="`${$route.hash === `#${data.item.uid}` ? 'active' : ''}`"
      >
        <span :class="{ 'text-red': data.item.error }">
          {{ data.value }}
        </span>
      </a>
    </template>
    <template #cell(remove)="data">
      <b-icon-x
        :class="`${stopActions === false ? 'pointer' : ''}`"
        @click="stopActions === false ? showRemoveConfirmation(data.index) : {}"
        v-if="buttonType === 'x'"
      />
      <b-icon-plus
        :class="`${stopActions === false ? 'pointer' : ''}`"
        @click="stopActions === false ? rowClickHandler(data.item.uid) : {}"
        v-if="buttonType === 'plus'"
      />
    </template>
  </b-table>
</template>

<script>
import { BIconPlus, BIconX } from 'bootstrap-vue';

export default {
  props: {
    // for when we don't want to be able to click on the
    // x or plus button
    stopActions: Boolean,
    buttonType: {
      validator(value) {
        if (value === 'plus' || value === 'x') {
          return 'success';
        }
        return 'danger';
      },
    },
  },
  data() {
    return {
      tableFields: ['reference', 'doi_url', { key: 'remove', label: '' }],
    };
  },
  components: {
    'b-icon-x': BIconX,
    'b-icon-plus': BIconPlus,
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
.text-red {
  color: red;
}

.active {
  background-color: yellowgreen;
}
</style>
