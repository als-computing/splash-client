<template>
  <div>
    <b-list-group>
      <b-list-group-item v-for="field in fields" :key="field[value] + field[name]" class="flex-column align-items-start bg-light m-2">
        <div class="overflow-hidden ">
          
          <div class="mb-1 text-muted text-break font-weight-light">
            <h5 class="mb-1"> {{ convertToTitleCase(field[name])}}</h5>
          </div>
          <p class="mb-1 text-black sm text-break font-weight-bold">
            {{field[value]}}
          </p>
          
        </div>
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
    fields: Array,
    name: String,
    value: String,
  },

  methods: {
    convertToTitleCase(str) {
       return str
        .replace(/([^A-Z])([A-Z])/g, '$1 $2') // split cameCase
        .replace(/[_\-]+/g, ' ') // split snake_case and lisp-case
        .toLowerCase()
        .replace(/(^\w|\b\w)/g, function(m) { return m.toUpperCase(); }) // title case words
        .replace(/\s+/g, ' ') // collapse repeated whitespace
        .replace(/^\s+|\s+$/, ''); // remove leading/trailing whitespace
    }
}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.title {
  font-size: 0.7em;
  font-weight: bold;
}


.list-group-item{
  border: none;
}
</style>
