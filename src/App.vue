<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="dark">
        <b-navbar-brand href="#">Splash</b-navbar-brand>

        <!-- <router-link to="/about">About</router-link> -->

        <b-navbar-toggle target="nav_collapse" />

        <b-collapse is-nav id="nav_collapse">
          <b-navbar-nav>
<!-- 
            <b-nav-item v-bind:to="'/'">Home</b-nav-item> -->
            <b-nav-item v-bind:to="'/runs'">Runs</b-nav-item>

          </b-navbar-nav>
        </b-collapse>
        <b-nav-text class="mx-3" id="user_name">
          {{user ? user.name : ''}}
        </b-nav-text>
        <span id="logout" v-if="isLoggedIn" >   | <b-button variant="light" @click="logout" class="mx-3">Logout</b-button></span>
    </b-navbar>
    <!-- <b-navbar>
      <SearchBar/>
    </b-navbar> -->
    <router-view/>

  </div>
</template>

<script>
import SearchBar from './components/SearchBar.vue';

export default {
  computed: {
    isLoggedIn() {
      return this.$store.getters['login/isLoggedIn'];
    },
    user() { return this.$store.getters['login/user']; },
  },
  methods: {
    logout() {
      this.$store.dispatch('login/logout')
        .then(() => {
          this.$router.push('/login');
        });
    },
  },
  components: {
    SearchBar,
  },
  created() {
    const store = this.$store;
    const router = this.$router;
    this.$api.interceptors.request.use((request) => {
      const access_token = store.getters['login/api_access_token'];
      if (access_token === '') {
        return request;
      }
      request.headers.Authorization = `Bearer ${access_token}`;
      return request;
    });
    this.$api.interceptors.response.use(undefined, (err) => new Promise(((resolve, reject) => {
      if (err.response && err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
        store.dispatch('login/logout').then(() => {
          router.push('/login');
        });
      }
      throw err;
    })));
  },
};
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
