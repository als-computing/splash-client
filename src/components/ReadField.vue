<template>
  <div>
      <b-card >
        <div class="title">{{name}}</div>
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
  width: 500px;
  min-height: 70px;
}
.title {
  font-size: 0.7em;
  font-weight: bold;
}
</style>
