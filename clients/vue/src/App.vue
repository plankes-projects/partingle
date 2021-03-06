<template>
  <div id="app">
    <BrowserPrivilegeChecker
      v-if="!browserPrivilegesOk"
      @browserPrivilegesOk="browserPrivilegesOk = true"
    ></BrowserPrivilegeChecker>
    <router-view v-else />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import BrowserPrivilegeChecker from "@/components/BrowserPrivilegeChecker.vue";

@Component({
  components: {
    BrowserPrivilegeChecker,
  },
})
export default class App extends Vue {
  private browserPrivilegesOk = false;
  private mounted() {
    document.title = "Partingle";
  }
}
</script>

<style lang="scss">
@import "https://use.fontawesome.com/releases/v5.6.3/css/all.css";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}

html {
  height: 100vh;
  background-image: url("/img/background.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-color: #f3f3f3;
}

body {
  height: 100vh;
}
</style>
