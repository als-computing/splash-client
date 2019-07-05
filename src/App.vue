<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="dark">
        <b-navbar-brand href="#">Splash</b-navbar-brand>

        <b-navbar-toggle target="nav_collapse" />

        <b-collapse is-nav id="nav_collapse">
          <b-navbar-nav>

            <b-nav-item v-bind:to="'/'">Home</b-nav-item>
           
          </b-navbar-nav>
        </b-collapse>
      <b-nav-form>
          <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Search" />
          <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
        </b-nav-form>

    </b-navbar>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #0f5ead;
}
</style>
