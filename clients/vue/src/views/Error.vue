<template>
  <div>
    <div>Something went wrong =(</div>
    <router-link :to="{ name: route }">BACK TO PARTY</router-link>
  </div>
</template>

<script lang="ts">
import { RouterNames } from "@/utils/RouterNames";
import { Component, Vue } from "vue-property-decorator";
@Component
export default class Error extends Vue {
  private route = RouterNames.PARTY;
}
</script>

<style lang="scss"></style>
