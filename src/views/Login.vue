<template>
  <div class="col d-flex justify-content-center">
    <!--The modal must have the :static="true" passed to it so that it can be tested-->
    <b-modal
      v-model="userNotRegisteredError"
      v-b-modal.modal-center
      ok-only
      :static="true"
    >Looks like you're not registered.</b-modal>
    <b-modal
      v-model="tooManyUsers"
      v-b-modal.modal-center
      ok-only
      :static="true"
    >Looks like you have multiple accounts. That shouldn't happen! Please contact the system admins.</b-modal>
    <b-modal
      v-model="otherError"
      v-b-modal.modal-center
      ok-only
      :static="true"
    >Something went wrong on our end. Please try again. If the problem persists contact the system admins.</b-modal>
    <b-card class=".mx-auto" title="Welcome to Splash!">
      <b-card-text>Please log with a google account</b-card-text>
      <b-spinner label="Loading..." v-show="loading"></b-spinner>
      <div id="google-sign-in-button" v-show="!loading"></div>
    </b-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      loading: true,
      gapiInitFailed: false,
      userNotRegisteredError: false,
      tooManyUsers: false,
      otherError: false,
    };
  },

  mounted() {
    this.renderButton();
  },

  methods: {
    renderButton() {
      console.log('rendered')
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
    },

    onFailure(error) {
      console.error('Sign in has failed!');
    },

    async onSignIn(googleUser) {
      try {
        this.loading = true;
        // const profile = googleUser.getBasicProfile();
        const idToken = googleUser.getAuthResponse().id_token;

        const config = { headers: { 'Content-Type': 'application/json' } };
        const response = await this.$api.post(
          this.$login_url + "?auth_provider=google",
          { token: idToken },
          config,
        );
        this.$store.commit('login/AUTH_SUCCESS', {
          user: response.data.user,
          api_access_token: response.data.access_token,
        });
        this.loading = false;
        await this.$router.push('/');
        return;
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
