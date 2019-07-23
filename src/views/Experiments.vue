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
                    {
                      key:  'name'
                    }, 
                    {
                        key: 'trials[0].polymer',
                    }, 
                    {
                        key:'technique.name',
                    } 
                    /*'solutes_present'*/, 
                    'researcher.name', 
                    'experiment_metadata.gap', 
                    'researcher.institution'],
                experiments:[],
                errors:[],
            }
        },
        created(){
            axiosInst.get('/experiments')
            .then(response=>{
                this.experiments = response.data
            })
            .catch(e =>{
               // this.errors.put(e)
            });
        },
        methods:{
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