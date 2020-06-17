// import Vue from 'vue';
import Router from 'vue-router';

import routes from './routes';
import store from './store';

const router = new Router({
  routes,
  mode: 'history',
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
      console.error(error);
    }
  }
  next();
});
export default router;
