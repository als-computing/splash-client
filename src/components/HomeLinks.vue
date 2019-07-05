<template>
  <div>
    <div>
        <b-card-group deck>
          
             <b-nav>
              <b-nav-item v-bind:to="'/compounds'">
                <b-card>Compounds </b-card>
              </b-nav-item>
             </b-nav>
          
            <b-nav>
              <b-nav-item v-bind:to="'/'">
                <b-card>Techniques </b-card>
              </b-nav-item>
            </b-nav>
           
           <b-nav>
              <b-nav-item v-bind:to="'/'">
                <b-card>Simulations </b-card>
              </b-nav-item>
            </b-nav>
          
          

        </b-card-group>
      </div>
    <div class="mt-3">
        <b-card-group deck>
            <b-nav>
              <b-nav-item v-bind:to="'/'">
                <b-card>People </b-card>
              </b-nav-item>
            </b-nav>
       
  
         <b-nav>
              <b-nav-item v-bind:to="'/'">
                <b-card>Publications </b-card>
              </b-nav-item>
            </b-nav>
          <b-nav>
              <b-nav-item v-bind:to="'/'">
                <b-card>News </b-card>
              </b-nav-item>
            </b-nav>
        </b-card-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeLinks',
  props: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card-body {
  width: 200px;
  height: 200px;
}
</style>