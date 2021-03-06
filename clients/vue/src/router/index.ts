import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import { RouterNames } from "@/utils/RouterNames";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/", 
    name: RouterNames.HOME,
     beforeEnter() {location.href = 'https://partingle.com'}
    //component: () => import("../views/Home.vue"),
  },
  {
    path: "/party",
    name: RouterNames.PARTY,
    component: () => import("../views/Party.vue"),
  },
  {
    path: "/join/:joinToken",
    name: RouterNames.JOIN,
    component: () => import("../views/Join.vue"),
  },
  {
    path: "/recover/:recoverToken",
    name: RouterNames.RECOVER,
    component: () => import("../views/Recover.vue"),
  },
  {
    path: "/error",
    name: RouterNames.ERROR,
    component: () => import("../views/Error.vue"),
  },
  {
    path: "/noHouse",
    name: RouterNames.NO_HOUSE,
    component: () => import("../views/NoHouse.vue"),
  },
  {
    path: "/host",
    name: RouterNames.HOST,
    component: () => import("../views/Host.vue"),
  },
  {
    path: "/map-dev",
    name: RouterNames.MAP_DEV,
    component: () => import("../views/MapDev.vue"),
  },
];

const router = new VueRouter({
  //mode: "history", //wont work on a static site
  base: process.env.BASE_URL,
  routes,
});

export default router;
