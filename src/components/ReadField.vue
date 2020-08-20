<template>
  <div>
        <h4><b><u>{{name}}</u></b></h4>
        <p>{{value || 'N/A'}}</p>
    </div>

</template>

<script>
export default {
  name: 'ReadField',
  props: {
    name: null,
    value: null,
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
