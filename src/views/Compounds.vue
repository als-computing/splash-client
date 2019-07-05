<template>
  <div>

    <b-container id="edit-container">
        <b-button v-b-modal.modal1 class="float-right" variant="info">Add Compound</b-button>
         <!-- Modal Component -->
        <b-modal id="modal1" title="Create Compound" @ok="createCompoundHandler">
             <b-form-input v-model="new_compound_name" type="text" placeholder="Enter compound name" />
        </b-modal>

    </b-container>  
    <b-table striped hover :items="compounds" :fields="fields" responsive="true" @row-clicked="rowClickHandler">
     
    </b-table>
  </div>
</template>

<script>
    //import axios from 'axios';
    export default {
        data() {
            return {
                fields: ['name', 'mwet_relevance', 'produced_water_relevance','analytical_techniques', 'spectroscopic_techniques'],
                compounds:[],
                errors:[],
                new_compound_name: ''
            }
        },
        created(){
            this.$api.get(this.$compounds_url)
            .then(response=>{
                this.compounds = response.data
            })
            .catch(e =>{
               // this.errors.put(e)
            });
        },
        methods:{
            rowClickHandler: function(compound){
                this.$router.push({path: 'compound/' + compound.uid})
            },
            createCompoundHandler: function(compound_name){
                try{
                    this.$api.get(this.$compounds_url + "/" + this.new_compound_name, JSON.stringify({"name": this.new_compound_name}))
                    .then(responds =>{
                        console.log("created");
                    })
                    .catch(e =>{
                        console.log(e)
                    })
                }
                catch(exception){

                }
             
            }
        }
    }
    
</script>

<style>
#edit-container {
  margin: 5px;
  height: 40px
}
</style>