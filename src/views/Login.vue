<template>
 <div>
   <h1>Welcome to Splash! Please log with your google account. </h1>
   <meta name="google-signin-client_id" :content="clientId">
   <form class="login" @submit.prevent="login">
    <div id="google-sign-in-button"> </div>

   </form>
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
    // setup the google login script here so that it's available when mounted
    const googleScript = document.createElement('script');
    googleScript.setAttribute('src', 'https://apis.google.com/js/platform.js?onload=init');
    document.head.appendChild(googleScript);
    window.gapi.load('auth2', () => {
      window.gapi.signin2.render('google-sign-in-button', {
        scope: 'profile email',
        width: 240,
        height: 50,
        longtitle: true,
        theme: 'dark',
        onsuccess: this.onSignIn,
        onfailure: this.onFailure,
      });
    });
    // TODO: Research about the login session state and how to check if you're signed in
  },
  methods: {
    login() {
      const { email } = this;
      const { password } = this;
      this.$store.dispatch('login', { email, password })
        .then(() => this.$router.push('/'))
        .catch((err) => console.log(err));
    },
    sendToken(token) {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const bodyParameters = {
        token,
      };
      this.$api.post(`${this.$login_url}`, bodyParameters, config).then(console.log).catch(console.log);
    },
    onFailure() { console.error('Sign in has failed!'); },
    onSignIn(googleUser) {
      const profile = googleUser.getBasicProfile();
      const idToken = googleUser.getAuthResponse().id_token;
      this.sendToken(idToken);
      console.log(profile.getGivenName());
    },
  },
};
</script>
