<template>
 <div>
   <b-card
      title="Welcome to Splash!"
      style="max-width: 20rem;">
     <b-card-text>
      Please log with a google account
    </b-card-text>
      <meta name="google-signin-client_id" :content="clientId">
      <form class="login" @submit.prevent="login">
        <div id="google-sign-in-button"> </div>
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
    };
  },

  mounted() {
    const onSignInFunc = this.onSignIn;
    const onErrorFunc = this.onFailure;
    setTimeout(() => {
      // wait until the GAuth initialization is done through the vue-google-oauth2
      // plugin.  See main.js
      window.gapi.signin2.render('google-sign-in-button', {
        scope: 'profile email',
        width: 240,
        height: 50,
        longtitle: true,
        theme: 'dark',
        onsuccess: onSignInFunc,
        onfailure: onErrorFunc,
      });
    }, 600);
  },

  methods: {


    onFailure(error) {
      console.error('Sign in has failed!');
    },

    async onSignIn(googleUser) {
      const profile = googleUser.getBasicProfile();
      const idToken = googleUser.getAuthResponse().id_token;

      try {
        const config = { headers: { 'Content-Type': 'application/json' } };

        try {
          const response = await this.$api.post(this.$login_url, { token: idToken }, config);
          console.log(response.data);
          localStorage.setItem('api_access_token', response.data.access_token);
          this.$store.commit('login/AUTH_SUCCESS', {
            user: response.data.user,
            api_access_token: response.data.access_token,
          });
          this.$router.push('/');
        } catch (error) {
          console.error('Failure!');
          // this.$store.commit('login/AUTH_ERROR', error);
          // localStorage.removeItem('api_access_token')
        }
      } catch (error) {
        console.error(error);
        this.$store.dispatch('login/logout');
      }
    },
  },
};
</script>
