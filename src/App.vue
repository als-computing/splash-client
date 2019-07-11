<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="dark">
        <b-navbar-brand href="#">Splash</b-navbar-brand>

        <b-navbar-toggle target="nav_collapse" />

        <b-collapse is-nav id="nav_collapse">
          <b-navbar-nav>
            
            <b-nav-item v-bind:to="'/'">Home</b-nav-item>
           
          </b-navbar-nav>
        </b-collapse>
    </b-navbar>
    <b-navbar>
      <SearchBar/>
    </b-navbar>
    <router-view/>
  </div>
</template>

<script>
import SearchBar from './components/SearchBar.vue'
export default {
  components: {
    SearchBar,
  }  
}
</script>


<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #0f5ead;
}
</style>
