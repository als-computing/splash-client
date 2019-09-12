<template>
 <div>
   <h1>Welcome to Splash! Please log with your google account. </h1>
   <meta name="google-signin-client_id" content="495944330919-ispvr4bmb2onnhvsh4n970jsdn1i8ner.apps.googleusercontent.com">
   <form class="login" @submit.prevent="login">
    <div id="google-signin-button"></div>

   </form>
 </div>
</template>

<script>
export default {
 
    data(){
        return {
            email : "",
            password : ""
        }
    },
    mounted() {
      //setup the google login script here so that it's available when mounted
      let googleScript = document.createElement('script')
      googleScript.setAttribute('src', 'https://apis.google.com/js/platform.js')
      document.head.appendChild(googleScript)
      window.gapi.signin2.render('google-signin-button', {
        onsuccess: this.onSignIn,
        onFailure: this.onFailure
      })
    },
    methods: {
      login: function () {
        let email = this.email 
        let password = this.password
        this.$store.dispatch('login', { email, password })
        .then(() => this.$router.push('/'))
        .catch(err => console.log(err))
      },
      onFailure(){ console.error('Sign in has failed!'); },
      onSignIn (googleUser) {
        const profile = googleUser.getBasicProfile()
        console.log(profile.getGivenName())
      }
    }
}
</script>