import PageEditing from './views/PageEditing.vue';
import PageVersions from './views/PageVersions.vue';
import Pages from './views/Pages.vue';
import Experiments from './views/Experiments.vue';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
// import Register from './views/Register.vue';
import SearchPage from './views/SearchPage.vue';
import ListCatalogs from './views/runs/ListCatalogs.vue';
import ListRuns from './views/runs/ListRuns.vue';
import Run from './views/runs/Run.vue';
import NotFound from './views/404.vue';

export default [
  {
    path: '/index.html',
    redirect: '/',
  },
  {
    path: '/login',
    name: 'login',
    component: Login,

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
      requiresAuth: true,
    },
  },
  {
    path: '/pages',
    name: 'pages',
    component: Pages,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/pages/:uid',
    name: 'page',
    component: PageEditing,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/pages/:uid/v/:version?',
    name: 'page-versions',
    component: PageVersions,
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
    },
  },
  {
    path: '/runs/',
    name: 'catalogs',
    meta: {
      requiresAuth: true,
    },
    component: ListCatalogs,
  },
  {
    path: '/runs/:catalog/:uid?',
    name: 'catalogs or runs',
    meta: {
      requiresAuth: true,
    },
    component: ListRuns,
  },
  {
    path: '/run/:catalog/:uid',
    name: 'run',
    meta: {
      requiresAuth: true,
    },
    component: Run,
  },
  {
    path: '*',
    name: '404',
    component: NotFound,
  },

];
