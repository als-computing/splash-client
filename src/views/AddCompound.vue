<template>
  <div id='app'>
    <form-factory :example="example" />
  </div>
</template>
<script>
  import FormFactory from '@/components/FormFactory.vue' 
  import SchemaInput from './examples/compound.js' 
  export default {
    data: function() {
      return {
        example: SchemaInput
      }
    },
    components: {
      FormFactory
    }
  }

</script>
