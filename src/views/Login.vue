<template>
 <div class="col d-flex justify-content-center">
   <!--The modal must have the :static="true" passed to it so that it can be tested-->
   <b-modal v-model="userNotRegisteredError" v-b-modal.modal-center ok-only :static="true">Looks like you're not registered.</b-modal>
   <b-modal v-model="tooManyUsers" v-b-modal.modal-center ok-only :static="true">Looks like you have multiple accounts. That shouldn't happen! Please contact the system admins.</b-modal>
   <b-modal v-model="otherError" v-b-modal.modal-center ok-only :static="true">Something went wrong on our end. Please try again. If the problem persists contact the system admins.</b-modal>
   <b-card
      class=".mx-auto"
      title="Welcome to Splash!">
     <b-card-text>
      Please log with a google account
    </b-card-text>
     <b-spinner label="Loading..." v-show=loading></b-spinner>
      <meta name="google-signin-client_id" :content="clientId">
      <form class="login" @submit.prevent="login">
        <div id="google-sign-in-button" v-show='!loading'> </div>
      </form>
   </b-card>


 </div>
</template>

<script>
export default {

  data() {
    return {
      email: '',
      password: '',
      clientId: process.env.VUE_APP_CLIENT_ID.concat('.apps.googleusercontent.com'),
      loading: true,
      gapiInitFailed: false,
      userNotRegisteredError: false,
      tooManyUsers: false,
      otherError: false,
      renderButtonId: undefined,
    };
  },

  mounted() {
    if (this.$gAuth === undefined) {
      console.error('vue-google-oauth2 plugin must be used by Vue');
      return;
    }
    // it checks every interval milliseconds to see if
    // the gapi library has been initialized by the GAuth plugin (see main.js)
    // and then will render the button if it is initialized
    // normally one would use a watcher but for some reason they don't seem capable of
    // detecting this change
    const interval = 100;
    this.renderButtonId = setInterval(() => { this.renderButton(interval); }, interval);
  },

  methods: {
    renderButton() {
      if (typeof this.renderButtonId !== 'number') {
        throw Error('renderButtonId must be a number');
      } else if (this.$gAuth.isInit) {
        window.gapi.signin2.render('google-sign-in-button', {
          scope: 'profile email',
          width: 240,
          height: 50,
          longtitle: true,
          theme: 'dark',
          onsuccess: this.onSignIn,
          onfailure: this.onFailure,
        });
        this.loading = false;
        clearInterval(this.renderButtonId);
      }
    },

    onFailure(error) {
      console.error('Sign in has failed!');
    },

    async onSignIn(googleUser) {
      try {
        this.loading = true;
        const profile = googleUser.getBasicProfile();
        const idToken = googleUser.getAuthResponse().id_token;

        const config = { headers: { 'Content-Type': 'application/json' } };
        const response = await this.$api.post(this.$login_url, { token: idToken }, config);
        localStorage.setItem('api_access_token', response.data.access_token);
        this.$store.commit('login/AUTH_SUCCESS', {
          user: response.data.user,
          api_access_token: response.data.access_token,
        });
        this.loading = false;
        this.$router.push('/');

        // this.$store.commit('login/AUTH_ERROR', error);
        // localStorage.removeItem('api_access_token')
      } catch (error) {
        console.error(error);
        if (error.response) {
          if (error.response.data.error === 'user_not_found') {
            this.userNotRegisteredError = true;
          } else if (error.response.data.error === 'multiple_users') {
            this.tooManyUsers = true;
          } else {
            this.otherError = true;
          }
        } else {
          this.otherError = true;
        }
        this.$store.dispatch('login/logout');
        this.loading = false;
      }
    },
  },
};
</script>
