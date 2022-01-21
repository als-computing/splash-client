<template>
  <b-card bg-variant="light" class="m-5">
    <h3>
      {{ errorMsg }}
      <span v-if="showReloadText"
        >Try <a :href="window.location.href">reloading</a> the page. If this does not
        work, contact the Splash team.</span
      >
      <span v-if="showReturnToMsg"> Return to <b-link :to='returnLink'>{{returnLinkText}}</b-link>.</span>
    </h3>
  </b-card>
</template>
<script>
export default {
  data() {
    return { window };
  },
  props: {
    errorMsg: {
      type: String,
      default: 'There is a problem in contacting the Splash server.',
    },
    showReloadText: {
      type: Boolean,
      default: true,
    },
    showReturnToMsg: {
      type: Boolean,
      default: false,
    },
    returnLinkText: {
      type: String,
      default: 'Home',
    },
    returnLink: {
      type: String,
      default: '/',
    },

  },
};
</script>
