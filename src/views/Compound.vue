<template>
  <div class="compound">
    <h1>{{compoundName}}</h1>
    <edit-fields
    :endpoint="this.$compounds_url"
    :uid="this.$route.params.uid"
    :path-arrays="[['metadata'],['documentation', 'sections']]"
    :column-sizes="[3,9]"
    @dataToParent="compoundName = arguments[0].species"/>
  </div>
</template>

<script>
// import ExperimentLineChart from '@/components/ExperimentLineChart.vue';
import EditFields from '@/components/EditFields.vue';

export default {
  data() {
    return {
      compoundName: undefined,
    };
  },

  methods: {

  },
  components: {
    'edit-fields': EditFields,
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
