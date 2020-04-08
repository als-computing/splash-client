<template lang="html">
  <div id="form-factory">
    <v-app>
      <v-content>
        <v-container fluid grid-list-md>
          <v-layout row>
            <v-flex xs6>
              <v-form ref="myForm" v-model="formValid">
                <v-jsonschema-form
                  v-if="schema"
                  :schema="schema"
                  :model="dataObject"
                  :options="options"
                  @error="e => window.alert(e)"
                  @change="change"
                  @input="input"
                >
                  <template v-slot:prepend-fullKeySlot="{fullSchema}">
                    Prepend slot<br>
                  </template>
                  <template v-slot:append-fullKeySlot="{fullSchema}">
                    Append slot
                  </template>
                  <template v-slot:fullKeySlot="{fullSchema}">
                    Full key slot: {{ fullSchema.description }}<br>
                  </template>
                  <template v-slot:custom-1="{fullSchema}">
                    Custom display slot: {{ fullSchema.description }}
                  </template>
                </v-jsonschema-form>
                <v-btn @click="handleClick">Add User</v-btn>
                     <v-btn
        color="error"
        class="mr-4"
        @click="reset"
      >
        Reset Form
      </v-btn> 
              </v-form>
              <h2 class="title my-4" style="text-align: left;">
                Data:
              </h2>
              <pre>{{ JSON.stringify(dataObject, null, 2) }}</pre>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import VJsonschemaForm from '@koumoul/vuetify-jsonschema-form'
//import examples from './examples'
import hjson from 'hjson' // more tolerant parsing of the schema for easier UX
import axios from 'axios'

export default {
  name: 'form-factory',
  components: { VJsonschemaForm },
  props: {
    example: Object,
  },
  data: function() {
    return {
      window,
      schema: null,
      schemaStr: '{}',
      schemaError: null,
      dataObject: {},
      //examples,
      formValid: false,
      options: null,
      axios: axios,
    }
  },
  mounted() {
    if (window.location.search) {
      //const key = window.location.search.replace('?example=', '')
      //this.example = examples.find(e => e.key === key)
    }
    this.applyExample()
  },
  methods: {
    applySchema() {
      try {
        this.schema = hjson.parse(this.schemaStr)
        this.schemaError = null
      } catch (err) {
        this.schemaError = err
      }
    },
    formatSchema() {
      try {
        const schema = hjson.parse(this.schemaStr)
        this.schemaStr = JSON.stringify(schema, null, 2)
        this.schemaError = null
      } catch (err) {
        this.schemaError = err
      }
    },
    applyExample() {
      const queryParams = `?example=${this.example.key}`
      if (window.location.search !== queryParams) window.location.search = queryParams

      this.schema = null
      setTimeout(() => {
        this.options = {
          httpLib: this.axios,
          debug: true,
          disableAll: false,
          autoFoldObjects: true,
          context: { owner: { type: 'organization', id: '5a5dc47163ebd4a6f438589b' } },
          accordionMode: 'normal',
          ...this.example.options || {}
        }
        this.dataObject = JSON.parse(JSON.stringify(this.example.data || {}))
        this.schemaStr = JSON.stringify(this.example.schema, null, 2)
        this.applySchema()
      }, 1)
    },
    change(e) {
      console.log('"change" event', e)
    },
    input(e) {
      console.log('"input" event', e)
    },
    handleClick() {
      console.log('Add Sample clicked')
      //axios.post('api/experiments', dataObject)
    },
    reset() {
      this.$refs.myForm.reset()
    },
  }
}
</script>

<style lang="css">
  pre {
    text-align: left;
  }
</style>
