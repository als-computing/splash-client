import Vue from 'vue'
import Router from 'vue-router'


import routes from './routes.js'
import store from './store.js'

Vue.use(Router)

let router = new Router({
  routes
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next()
      return
    }
    next('/login') 
  } else {
    next() 
  }
})
export default router