<template>
  <div>

    <!-- <b-container id="edit-container">
       <b-button v-b-modal.modal1 class="float-right" variant="info">Add Compound</b-button> 

        <b-modal id="modal1" title="Create Compound" @ok="createCompoundHandler">
             <b-form-input v-model="new_compound_name" type="text" placeholder="Enter compound name" />
        </b-modal>

    </b-container>  
    -->
    <div style="text-align: left;">
      
        <b-container fluid>
            <b-row>
                <b-col cols="8" md="auto">
                    <b-jumbotron>
                        <template v-slot:header>Model Fluid Platform</template>
                        <template v-slot:lead>The Model Fluid Platform (MFP) describes the hierarchy of fluids that will be used among all GAPs.</template>
                        <p>The platform consists of a series of stages to characterize the effects of different chemical species on membrane performance.</p>
                        <p>MFP compounds are selected based on: </p>
                        <ol>
                            <li>Fundamental properties  </li>
                            <li>Prevalent interactions of the compounds or functional groups with membrane fluids and materials</li>
                            <li>Their presence and impact on separation and/or recovery from energy related fluids such as produced water. 
                            Solutes of Interest</li>
                        </ol>
                    </b-jumbotron>
                </b-col>
                <b-col cols="4">
                 <b-img :src="images.mfp" fluid alt="MFP Logo"></b-img>
                </b-col>
            </b-row>
        </b-container>
    </div>
    <b-table striped hover :items="compounds" :fields="fields" responsive="true" @row-clicked="rowClickHandler">
   
    </b-table>
  </div>
</template>

<script>
    
    //import axios from 'axios';
    export default {
       
        data() {
            return {
                fields: ['Name', 'Fundamental Treatment Challenges'],
                compounds:[],
                errors:[],
                new_compound_name: '',
                images: {
                    mfp: require('@/assets/images/mfp.png')
                }
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