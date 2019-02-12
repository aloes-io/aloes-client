import Vue from "vue";
import Router from "vue-router";
import store from "@/store";
import Account from "@/views/Account.vue";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import(/* webpackChunkName: "home" */ "./views/Home.vue")
    },
    {
      path: "/login",
      name: "login",
      props: true,
      component: () =>
        import(/* webpackChunkName: "login" */ "./views/Login.vue")
    },
    {
      path: "/account",
      name: "account",
      meta: { requiresAuth: true },
      component: Account,
      props: route => ({
        token: route.query.token,
        userId: route.query.userId
      })
    },
    {
      path: "/reset-password",
      name: "reset-password",
      props: route => ({
        token: route.query.token,
        userId: route.query.userId
      }),
      component: () =>
        import(/* webpackChunkName: "reset-password" */ "./views/ResetPassword.vue")
    },
    {
      path: "/device",
      name: "device",
      meta: { requiresAuth: true },
      props: route => ({
        token: route.query.token,
        userId: route.query.userId
      }),
      component: () =>
        import(/* webpackChunkName: "register" */ "./views/Device.vue")
    },
    {
      path: "/search",
      name: "search",
      meta: { requiresAuth: true },
      props: route => ({
        token: route.query.token,
        userId: route.query.userId
      }),
      component: () =>
        import(/* webpackChunkName: "search" */ "./views/Search.vue")
    },
    {
      path: "/profile",
      name: "profile",
      meta: { requiresAuth: true, requiresPaid: true },
      props: route => ({
        profileType: route.query.profileType,
        profileId: route.query.profileId
      }),
      component: () =>
        import(/* webpackChunkName: "profile" */ "./views/Profile.vue")
    },
    {
      path: "/team",
      name: "team",
      meta: { requiresAuth: true, requiresPaid: true },
      props: true,
      component: () => import(/* webpackChunkName: "team" */ "./views/Team.vue")
    },
    {
      path: "/about",
      name: "about",
      props: route => ({
        tab: route.query.tab
      }),
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    },
    {
      path: "*",
      component: () =>
        import(/* webpackChunkName: "notfound" */ "./views/NotFound.vue")
    }
  ]
});

store.dispatch("auth/syncRouter", router);

export default router;
