<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="dark">
        <b-navbar-brand href="#">Splash</b-navbar-brand>
        <router-link to="/about">About</router-link><span v-if="isLoggedIn"> | <a @click="logout">Logout</a></span>

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
  computed : {
    isLoggedIn : function(){ return this.$store.getters.isLoggedIn}
  },
  methods: {
    logout: function () {
      this.$store.dispatch('logout')
      .then(() => {
        this.$router.push('/login')
      })
    }
  },
  components: {
    SearchBar,
  }, 
  created: function () {
    this.$http.interceptors.response.use(undefined, function (err) {
      return new Promise(function (resolve, reject) {
        if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
          this.$store.dispatch(logout)
        }
        throw err;
      });
    });
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
