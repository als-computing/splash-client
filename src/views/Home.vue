<template>
  <div class="home">
  <b-jumbotron>

    <HomeLinks/>
  </b-jumbotron>
  </div>
</template>

<script>
// @ is an alias to /src
import HomeLinks from '@/components/HomeLinks.vue';

export default {
  name: 'home',
  components: {
    HomeLinks,
  },
};
</script>
