<template>
  <div>
    <div>HOME !</div>
    <router-link :to="{ name: routeHost }">HOST LINK</router-link>
  </div>
</template>

<script lang="ts">
import { RouterNames } from "@/utils/RouterNames";
import { Component, Vue } from "vue-property-decorator";
@Component
export default class Error extends Vue {
  private routeHost = RouterNames.HOST;
}
</script>

<style lang="scss"></style>
