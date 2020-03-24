<template>
  <div>
      <b-card >
        <h6>{{name}}</h6>
        <b-card-text>{{value}}</b-card-text>
      </b-card>
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
.card-body {
  width: 300px;
  height: 70px;
}
</style>
