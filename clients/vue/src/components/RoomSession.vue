<template>
  <iframe id="roomSessionIframe" class="iframe" :src="iFrameUrl"></iframe>
</template>

<script lang="ts">
import { GeneralUtils } from "@/utils/GeneralUtils";
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component
export default class RoomSession extends Vue {
  @Prop() private sessionId!: string | null;

  get iFrameUrl(): string {
    return "/jitsiExternalApi.html?room=" + this.sessionId;
  }

  @Watch("sessionId")
  private async currentRoomChanged() {
    if (this.sessionId && !GeneralUtils.isDevEnv()) {
      this.emitHangUpIfNeeded();
      for (let i = 0; i < 10; i++) {
        await GeneralUtils.sleep(500);
        if (this.jitsoIsLoaded()) {
          console.log("RoomSession: jitsi loaded");
          break;
        } else {
          console.log("RoomSession: jitsi not loaded");
        }
      }
    }
    this.$emit("jitsiLoaded");
  }

  private async emitHangUpIfNeeded() {
    let hangup = false;
    while (!hangup) {
      try {
        const url: string = this.getIFrameUrlString();
        if (url.includes("close")) {
          hangup = true;
        }
      } catch (e) {
        //nothing to do here
      }
      await GeneralUtils.sleep(50);
    }
    console.log("RoomSession: Hangup detected, emiting hangUp");
    this.$emit("hangUp");
  }

  private getIFrameUrlString(): string {
    try {
      const el: any = document.getElementById("roomSessionIframe");
      const url: string = el.contentWindow.location.href;
      return url;
    } catch (e) {
      return "";
    }
  }

  private getIFrameHtmlString(): string {
    try {
      const el: any = document.getElementById("roomSessionIframe");
      const html: string = el.contentWindow.document.body.innerHTML;
      return html;
    } catch (e) {
      return "";
    }
  }

  private jitsoIsLoaded(): boolean {
    const html: string = this.getIFrameHtmlString();
    return html.includes('id="largeVideoWrapper" style=');
  }

  private async mounted() {
    await this.currentRoomChanged();
  }
}
</script>

<style scoped lang="scss">
.iframe {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
