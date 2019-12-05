/* Copyright 2019 Edouard Maleix, read LICENSE */

import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
  },
  {
    path: '/about',
    name: 'about',
    props: route => ({
      tab: route.query.tab,
    }),
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/login',
    name: 'login',
    props: true,
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
  {
    path: '/auth',
    name: 'auth',
    meta: { requiresAuth: false },
    component: () => import(/* webpackChunkName: "auth" */ '../views/Auth.vue'),
    props: route => ({
      'access-token': route.query['access-token'],
      'user-id': route.query['user-id'],
    }),
  },
  {
    path: '/account',
    name: 'account',
    meta: { requiresAuth: true },
    component: () => import(/* webpackChunkName: "account" */ '../views/Account.vue'),
    props: route => ({
      'access-token': route.query['access-token'],
      'user-id': route.query['user-id'],
    }),
  },
  {
    path: '/profile',
    name: 'profile',
    meta: { requiresAuth: true },
    props: route => ({
      profileType: route.query.profileType,
      profileId: route.query.profileId,
    }),
    component: () => import(/* webpackChunkName: "profile" */ '../views/Profile.vue'),
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    props: route => ({
      'access-token': route.query['access-token'],
      'user-id': route.query['user-id'],
    }),
    component: () => import(/* webpackChunkName: "reset-password" */ '../views/ResetPassword.vue'),
  },
  {
    path: '/device',
    name: 'device',
    meta: { requiresAuth: true },
    props: route => ({
      'access-token': route.query['access-token'],
      'user-id': route.query['user-id'],
      deviceId: route.query.deviceId,
    }),
    component: () => import(/* webpackChunkName: "device" */ '../views/Device.vue'),
  },
  {
    path: '/application',
    name: 'application',
    meta: { requiresAuth: true },
    props: route => ({
      'access-token': route.query['access-token'],
      'user-id': route.query['user-id'],
      applicationId: route.query.applicationId,
    }),
    component: () => import(/* webpackChunkName: "application" */ '../views/Application.vue'),
  },
  {
    path: '/search',
    name: 'search',
    meta: { requiresAuth: true },
    props: route => ({
      'access-token': route.query['access-token'],
      'user-id': route.query['user-id'],
    }),
    component: () => import(/* webpackChunkName: "search" */ '../views/Search.vue'),
  },
  {
    path: '/team',
    name: 'team',
    meta: { requiresAuth: true },
    props: true,
    component: () => import(/* webpackChunkName: "team" */ '../views/Team.vue'),
  },
  {
    path: '*',
    component: () => import(/* webpackChunkName: "notfound" */ '../views/NotFound.vue'),
  },
];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

store.dispatch('auth/syncRouter', router);

export default router;
