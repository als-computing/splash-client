<template>
    <b-overlay :show="additionalRefsLoading" rounded="sm">
      <b-table striped hover :items="items" :fields="table_fields">
        <template #cell(index)="data"> {{ data.index + 1 }}. </template>
        <template #cell(citation)="data">
          <div align="left">
            <a :name="data.item.doi">
              <span
                :class="`${
                  $route.hash === `#${data.item.doi}` ? 'active' : ''
                }`"
                v-if="items[data.index].error"
                >{{ data.value }}</span
              >
              <span
                :class="`${
                  $route.hash === `#${data.item.doi}` ? 'raw-html-active' : ''
                }`"
                v-else
                v-html="data.value"
              ></span>
            </a>
          </div>
        </template>
      </b-table>
    </b-overlay>
</template>
<script>
import AddReferences from '@/components/editor/AddReferences.vue';

export default {
  props: { refrences: Array },
  components: {
    AddReferences,
  },
  data() {
    return {

    };
  },
};
</script>
