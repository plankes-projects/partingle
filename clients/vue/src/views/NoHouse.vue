<template>
  <div>
    <div>You are currently not in a house! (Maybe you got kicked out? =()</div>
    <router-link :to="{ name: routeHome }">Go to home</router-link>
  </div>
</template>

<script lang="ts">
import { RouterNames } from "@/utils/RouterNames";
import { Component, Vue } from "vue-property-decorator";
@Component
export default class NoHouse extends Vue {
  private routeHome = RouterNames.HOME;
}
</script>

<style lang="scss"></style>
