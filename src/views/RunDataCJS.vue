<template>
  <div class="run-data">
    <h1 v-if="loaded">{{metadata.start.sample_name}}</h1>
  <b-jumbotron>
      <b-card-group deck>

      </b-card-group>
  </b-jumbotron>
   
    <div class="container">
        <line-chart  v-if="loaded"
            :chartdata="chartdata"
            :options="options"/>
    </div>
  </div>
</template>

<script>
import ReadField from '@/components/ReadField.vue'
import LineChart from '@/components/LineChart.js'
export default {
   data: () => ({
   
            loaded: false, 
            metadata: {},
            chartdata: [],
            options: {
                elements: {
                    line: {
                        tension: 0.000001
                    }
                },
                showLines: true,
                scales: {
                    yAxes: [{
                        stacked: true
                    }]
                },
                legend: {
                    position: 'bottom'
//var name = this.$route.params.name;
                }
            }

    }),
 
    async mounted(){
        
        try{
            this.loaded = false
            const response = await this.$api.get(this.$runs_url + "/" + this.$route.params.name)
            const chartdata = {}
            this.metadata = response.data.metadata
            this.label = 'time'

            this.chartdata.datasets = [{fill: false, label: this.metadata.start.sample_name, borderColor: 'rgba(0, 0, 0, 1)', data: response.data.data}]
            this.loaded = true
            
            
        }
        catch (e){
            console.error(e)
        }
       
    },
     
    components:{
        LineChart
    }
    
}
</script>
