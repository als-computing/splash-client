<template>
  <div>
    <b-table striped hover :items="experiments" :fields="fields" responsive="true" @row-clicked="rowClickHandler">
    </b-table>
    <div class="footer navbar fixed-bottom justify-content-center">
      <b-pagination-nav
        v-if="totalPages > 1 && currPageOnNextTick != 0"
        :link-gen="linkGen"
        :number-of-pages="totalPages"
        :value="currPageOnNextTick"
        use-router
      />
     </div>
  </div>
</template>

<script>
    import axios from 'axios';
    var axiosInst = axios.create({
        baseURL: "/api",
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
                totalPages: 0,
                experiments:[],
                currPageOnNextTick: 0,
                RESULTS_PER_PAGE: 10,
            }
        },
        computed: {
            currPageComputed() {
                return this.$route.query.page;
            }
        },
        created(){
           //console.log("created")
           this.retrieveData()
        },
        watch: {
            $route() {
                //console.log("watched")
                this.retrieveData()
            }
        },
        methods:{
            linkGen(pageNum) {
                return {
                    path: "/experiments",
                    query: {
                    query: this.$route.query.query,
                    page: pageNum
                    }
                };
            },
            retrieveData() {
                this.experiments =[];
                let page;
                if (
                !this.currPageComputed ||
                !Number.isInteger(Number(this.currPageComputed)) ||
                Number(this.currPageComputed) <= 0
                ) {
                this.$router.replace({
                    path: "experiments",
                    query: { query: this.$route.query.query, page: 1 }
                });
                // IMPORTANT, this makes sure axios doesn't get called twice when redirecting
                return;
                }
                page = Number(this.currPageComputed);
                axiosInst.get('/experiments?page='+ page)
                .then(response =>{
                    this.organizeData(response.data)

                })
                .catch(e =>{
                    console.log(e)
                });
                
                this.$nextTick().then(() => {
                    this.currPageOnNextTick = Number(this.$route.query.page);
                });
            },
            organizeData(data){
                this.totalPages = data.total_results/this.RESULTS_PER_PAGE;
                data.results.forEach((elem)=> {
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

</style>