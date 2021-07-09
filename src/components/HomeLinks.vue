<template>
  <div>
    <div>
      <b-card-group deck>
         <b-nav>
          <b-nav-item v-bind:to="'/compounds'">
            <b-card>Compounds</b-card>
          </b-nav-item>
        </b-nav>
        <b-card-group deck>
          <b-nav>
            <b-nav-item href='/help/' target="_blank">
              <b-card>Help</b-card>
            </b-nav-item>
          </b-nav>
        </b-card-group>
      </b-card-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeLinks',
  props: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card-body {
  width: 200px;
  height: 200px;
}
</style>
