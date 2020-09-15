<template>
  <div>
    <b-list-group>
      <b-list-group-item v-for="data in fieldArray" :key="data[value] + data[name]">
        {{data[name]}}:
        <h5>{{data[value]}}</h5>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'ReadFields',
  // this array should have an object that looks like this:
  // {name: 'foo', value: 'bar'}
  props: {
    fieldArray: Array,
    name: String,
    value: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.title {
  font-size: 0.7em;
  font-weight: bold;
}
</style>
