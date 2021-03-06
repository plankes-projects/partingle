<template>
  <div class="mobileError" v-if="myIsTablet">
    This does not work on tablets. Please switch to a computer or try using the
    desktop mode of your browser.
  </div>
  <div class="mobileError" v-else-if="myIsMobile">
    This does not work on mobile. Please switch to a computer.
  </div>
  <div v-else-if="firstCheckDone" class="entryImage">
    <h1>Allow microphone and video before continue</h1>
    <template v-if="isFireFox()">
      <img v-if="firstImagesShown" src="/img/entry/firefox1.png" />
      <img v-else src="/img/entry/firefox2.png" />
    </template>
    <template v-else>
      <img v-if="firstImagesShown" src="/img/entry/chrome1.png" />
      <img v-else src="/img/entry/chrome2.png" />
    </template>
  </div>
</template>

<script lang="ts">
import { GeneralUtils } from "@/utils/GeneralUtils";
import { Component, Vue } from "vue-property-decorator";
import { isMobile, isTablet } from "mobile-device-detect";

@Component
export default class BrowserPrivilegeChecker extends Vue {
  private firstImagesShown = true;
  private firstCheckDone = false;

  private myIsTablet = false;
  private myIsMobile = false;

  private async permissionCheckLoop() {
    // its much faster to query this than start with the request check.
    // We make everything faster and avoid flickering for people who grandet permissions already.
    let permissionOk = false;
    try {
      const prom1 = navigator.permissions.query({ name: "camera" });
      const prom2 = navigator.permissions.query({ name: "microphone" });
      permissionOk =
        (await prom1).state == "granted" && (await prom2).state == "granted";
    } catch (e) {
      //do not care
    }

    while (!permissionOk) {
      this.firstCheckDone = true;
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        permissionOk = true;
      } catch (e) {
        console.log("NO PERMISSION!");
        this.firstImagesShown = false;
        await GeneralUtils.sleep(200);
      }
    }
    this.$emit("browserPrivilegesOk");
  }

  private isFireFox() {
    return navigator.userAgent.indexOf("Firefox") > -1;
  }

  private async mounted() {
    if (isTablet) {
      this.myIsTablet = true;
    } else if (isMobile) {
      this.myIsMobile = true;
    } else {
      this.permissionCheckLoop();
    }
  }
}
</script>

<style scoped lang="scss">
.entryImage {
  position: fixed; /* or absolute */
  top: 50%;
  left: 50%;
  width: 50em;
  height: 30em;

  margin-left: -25em;
  margin-top: -20em;
}

h1 {
  font-size: 2em;
}

.mobileError {
  font-size: 2em;
}
</style>
