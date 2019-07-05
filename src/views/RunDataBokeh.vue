<template>

  <div class="run-data">

    <h1 v-if="loaded"></h1>
  <b-jumbotron>
      <b-card-group deck>

      </b-card-group>
  </b-jumbotron>
   
    <div id="myplot">

    </div>
  </div>
</template>

<script>

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
            this.loaded = false;
            // const response = await this.$api.get(this.$ruiteml + "/" + thisompounds.$route.params.name)
            const response = await this.$api.get("get-plot-bokeh/" + this.$route.params.uid)
            Bokeh.embed.embed_item(response.data);
            this.loaded = true
            
            
        }
        catch (e){
            console.error(e)
        }
       
    },
     
    // components:{
        
    // }
    
}
</script>
