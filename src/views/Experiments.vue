<template>
  <div>
    <b-table striped hover :items="experiments" :fields="fields" responsive="true" @row-clicked="rowClickHandler">
     
    </b-table>
  </div>
</template>

<script>
    import axios from 'axios';
    var axiosInst = axios.create({
        baseURL: "http://127.0.0.1:5000/api",
        headers: {
            'Content-Type': "application/json"
        }
        })
    export default {
        data() {
            return {
                fields: [
                    
                    'name',
                    'polymer',
                    'technique',
                    'solutes_present', 
                    'researcher', 
                    'gap', 
                    'institution'],
                experiments:[],
                errors:[],
            }
        },
        created(){
            axiosInst.get('/experiments')
            .then(response =>{
                this.organizeData(response.data)
            })
            .catch(e =>{
              console.log(e)
            });
        },
        methods:{
            organizeData(data){
                data.forEach((elem)=> {
                    this.experiments.push({
                        name: elem.name,
                        technique: elem.technique.name,
                        polymer: elem.trials[0].membrane_or_polymer,
                        solutes_present: elem.trials[0].solutes_present.toString().replace(/,/g, " "),
                        researcher: elem.researcher.name,
                        gap: elem.experiment_metadata.gap,
                        institution: elem.researcher.institution,
                    })
                })
        },
            rowClickHandler: function(experiment){
                //TODO
                return
            },
        }
    }
    
</script>

<style>
#edit-container {
  margin: 5px;
  height: 40px
}
</style>