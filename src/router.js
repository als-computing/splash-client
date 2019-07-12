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
      path: '/runs/:name',
      name: 'runs',
      component: () => import(/* webpackChunkName: "run" */ './views/RunDataCJS.vue')
    },
    {
      path: '/bokeh/:uid',
      name: 'bokeh',
      component: () => import(/* webpackChunkName: "run" */ './views/RunDataBokeh.vue')
    },
    {
      path: '/bokehjs/:uid',
      name: 'bokehjs',
      component: () => import(/* webpackChunkName: "run" */ './views/RunDataBokehAllJS.vue')
    },
    {
      path: '/rund3/:uid',
      name: 'rund3',
      component: () => import(/* webpackChunkName: "run" */ './views/RunDataD3.vue')
    },
    {
      path: '/compound/:name',
      name: 'compound',
      component: () => import(/* webpackChunkName: "compound" */ './views/Compound.vue')
      //component: Compound
    },
    {
      path: '/runschartjs/:name',
      name: 'runschartjs',
      component: () => import(/* webpackChunkName: "run" */ './views/RunData.vue')
    }
  ]
})
