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
            const response = await this.$api.get("get-nexafs-matrix/" + this.$route.params.uid);
            var source = new Bokeh.ColumnDataSource({ data: response.data });
            const tools = "pan,crosshair,wheel_zoom,box_zoom,reset,save";
            //Bokeh.embed.embed_item(response.data);
            var plot = new Bokeh.Plotting.figure({
                title: "BokehJS Plot",
                plot_width: 400,
                plot_height: 400,
                background_fill_color: "#F2F2F7",
                tools: tools
            });
            const data = response.data;
            var line = new Bokeh.Line({
                x: { field: "x" },
                y: { field: "y" },
                line_color: "#666699",
                line_width: 2
            });
            plot.add_glyph(line, source);
            Bokeh.Plotting.show(plot);
            
            this.loaded = true;
            
            
        }
        catch (e){
            console.log(e)
        }
       
    },
     
    // components:{
        
    // }
    
}
</script>
