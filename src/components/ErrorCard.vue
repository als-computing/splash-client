<template>
  <b-card  bg-variant="light" class="m-5">

    <h3>
      {{ errorMsg }} Try <a :href="$route.fullPath">reloading</a> the page. If this does not work,
      contact the Splash team.
    </h3>
  </b-card>
</template>
<script>
export default {
  props: {
    errorMsg: {
      type: String,
      default: 'There is a problem in contacting the Splash server.',
    },

  },
};
</script>
