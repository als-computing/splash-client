import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/index.html",
      redirect: "/" 
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    { 
      path: '/search',
      name: 'searchPage',
      component: () => import(/* webpackChunkName: "search" */ './views/SearchPage.vue'),
    },
    {
      path: '/compounds',
      name: 'compounds',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "compounds" */ './views/Compounds.vue')
    },
  
    {
      path: '/compound/:name',
      name: 'compound',
      component: () => import(/* webpackChunkName: "compound" */ './views/Compound.vue')
      //component: Compound
    },

    { 
        path: '/experiments',
        name: 'experiments',
        component: () => import(/* webpackChunkName: "experiments" */ './views/Experiments.vue')
    },
    {
        path: '/api',
      
    }
  ]
})
