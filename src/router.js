// import Vue from 'vue';
import Router from 'vue-router';

import routes from './routes';
import store from './store';

const router = new Router({
  routes,
  mode: 'history',
  base: `/${process.env.VUE_APP_SPLASH_BASE}/`,
  store,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const isAuth = store.getters['login/isLoggedIn'];

    if (isAuth) {
      next();
      return;
    }
    try {
      next('/login');
      return;
    } catch (error) {
      console.error('Could not redirect to /login route');
    }
  }
  next();
});
export default router;
