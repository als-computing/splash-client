import Compound from './views/Compound.vue';
import Compounds from './views/Compounds.vue';
import CreateUpdateExperiment from './views/CreateUpdateExperiment.vue';
import Experiments from './views/Experiments.vue';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
// import Register from './views/Register.vue';
import SearchPage from './views/SearchPage.vue';

export default [
  {
    path: '/index.html',
    redirect: '/',
  },
  {
    path: '/login',
    name: 'login',
    component: Login

  },
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/search',
    name: 'searchPage',
    component: SearchPage,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/compounds',
    name: 'compounds',
    component: Compounds,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/compound/:uid',
    name: 'compound',
    component: Compound,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/experiments',
    name: 'experiments',
    component: Experiments,
    meta: {
      requiresAuth: true,
    }
  }

];
