<template>
  <div id="app">
    <!--This v-if is here because using the router query we may want to hide the navbar
    on some occasions.-->
    <b-navbar toggleable="lg" type="dark" variant="dark" v-show="$route.query.hideNavbar !== 'true'">
      <b-navbar-brand to="/" v-if="!error">Splash</b-navbar-brand>
      <!-- The reason for the href is so that if there is an error it will actually reload
      when navigating to the splash home page rather than just changing the router-view, which is hidden at
      the moment -->
      <b-navbar-brand href="/" v-else>Splash</b-navbar-brand>
      <!-- <router-link to="/about">About</router-link> -->

      <b-navbar-toggle target="nav_collapse" />

      <b-collapse is-nav id="nav_collapse">
        <div v-if="!error">
          <b-navbar-nav>
            <!--
            <b-nav-item v-bind:to="'/'">Home</b-nav-item> -->
            <b-nav-item v-bind:to="'/compounds'">Compounds</b-nav-item>
          </b-navbar-nav>
        </div>
      </b-collapse>
      <div v-if="!error">
        <b-nav-text class="mx-3" id="user_name">
          {{ user ? user.given_name : "" }}
        </b-nav-text>
        <span id="logout" v-if="isLoggedIn">
          |
          <b-button variant="light" @click="logout" class="mx-3"
            >Logout</b-button
          ></span
        >
      </div>
    </b-navbar>
    <b-container>
      <b-row>
        <error-card
          v-if="error"
          error-msg="There is a problem contacting the Splash server, and the application cannot load."
          class="mt-5"
        />
      </b-row>
    </b-container>
    <!-- <b-navbar>
      <SearchBar/>
    </b-navbar> -->
    <router-view v-if="!error" />
  </div>
</template>

<script>
// import SearchBar from './components/SearchBar.vue';
import ErrorCard from '@/components/ErrorCard.vue';

export default {
  props: {
    error: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters['login/isLoggedIn'];
    },
    user() {
      return this.$store.getters['login/user'];
    },
  },
  methods: {
    logout() {
      this.$store.dispatch('login/logout').then(() => {
        this.$router.push('/login');
      });
    },
  },
  components: {
    // SearchBar,
    ErrorCard,
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
    this.$api.interceptors.response.use(
      undefined,
      (err) =>
        new Promise((resolve, reject) => {
          if (
            err.response &&
            err.response.status === 401 &&
            err.config &&
            !err.config.__isRetryRequest
          ) {
            store.dispatch('login/logout').then(() => {
              router.push('/login');
            });
          }
          throw err;
        }),
    );
  },
};
</script>


<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #0f5ead;
}
</style>
