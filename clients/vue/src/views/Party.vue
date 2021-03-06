<template>
  <div>
    <div
      id="roomPortrayalBackground"
      style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: -10; background-color: black; "
    ></div>
    <div id="roomPortrayalImageA" :style="roomPortrayalImageAStyle"></div>
    <div id="roomPortrayalImageB" :style="roomPortrayalImageBStyle"></div>

    <RoomSession
      style="background-color:#00000000;"
      v-if="jitsiSessionId"
      :sessionId="jitsiSessionId"
      @jitsiLoaded="jitsiLoaded = true"
      @hangUp="hangup()"
    ></RoomSession>

    <div class="miniMapZoom" :style="miniMapZoomStyle">
      <span @click="changeMinimapScale(0.8)">
        <b-icon icon="search-minus" class="zoomIcon"> </b-icon>
      </span>
      <span @click="changeMinimapScale(1.2)">
        <b-icon icon="search-plus" class="zoomIcon"> </b-icon>
      </span>
    </div>
    <MiniMap
      v-if="houseLayout"
      :houseLayout="houseLayout"
      :houseId="houseId"
      :currentRoomId="currentRoomId"
      :style="minimMapStyle"
    ></MiniMap>

    <RoomPropertyViewer
      class="roomProps"
      :roomProperties="roomProperties"
    ></RoomPropertyViewer>

    <div class="interactiveMapZoom">
      <span @click="changeIntMapScale(0.8)">
        <b-icon icon="search-minus" class="zoomIcon"> </b-icon>
      </span>
      <span @click="changeIntMapScale(1.2)">
        <b-icon icon="search-plus" class="zoomIcon"> </b-icon>
      </span>
    </div>
    <InteractiveMap
      @roomChanged="roomChanged"
      @joinTokenChanged="joinTokenChanged"
      @houseLayoutLoaded="houseLayoutLoaded"
      :autoAcceptNewUser="autoAcceptNewUser"
      :showRinging="showRinging"
      :style="interactiveMapStyle"
    ></InteractiveMap>

    <b-modal :active.sync="isLinkInfoModalActive" scroll="keep">
      <section class="section">
        <div class="card">
          <div class="card-content">
            Please note those 2 links:<br /><br />
            <b>Share this link with your guests:</b><br />
            {{ joinLink }}
            <span v-if="recoverToken">
              <br />
              <br />
              <b>
                Host login - in case you get locked out <br />
                (DON'T share this)
              </b>
              <br />
              {{ recoverLink }}
            </span>
          </div>
          <div class="card-content">
            <b-button
              @click="isLinkInfoModalActive = false"
              type="is-success"
              size="is-medium"
              icon-right="arrow-circle-right"
            >
              Continue
            </b-button>
          </div>
        </div>
      </section>
    </b-modal>

    <b-modal> </b-modal>
  </div>
</template>

<script lang="ts">
import { InitialData } from "@/generated/api-axios";
import { Component, Vue } from "vue-property-decorator";
import InteractiveMap from "@/components/InteractiveMap.vue";
import RoomSession from "@/components/RoomSession.vue";
import { StateUtils } from "@/utils/StateUtils";
import { HouseLayout } from "@/utils/InteractiveMap/HouseLayoutInterfaces";
import MiniMap from "@/components/MiniMap.vue";
import RoomPropertyViewer from "@/components/RoomPropertyViewer.vue";
import { RouterNames } from "@/utils/RouterNames";
import { UrlUtils } from "@/utils/UrlUtils";
import { GeneralUtils } from "@/utils/GeneralUtils";

@Component({
  components: {
    InteractiveMap,
    RoomSession,
    MiniMap,
    RoomPropertyViewer,
  },
})
export default class Home extends Vue {
  private recoverLink = "";
  private joinLink = "";
  private jitsiSessionId: string | null = null;
  private roomProperties: string[] = [];

  private recoverToken: string | undefined = "";
  private joinToken: string | undefined = "";
  private autoAcceptNewUser = false;
  private showRinging = true;

  private houseLayout: HouseLayout | null = null;
  private houseId!: number;
  private currentRoomId = 0;

  private interactiveMapStyle = "display:none;";
  private minimMapStyle = "display:none;";
  private miniMapZoomStyle = "display:none;";

  private initialData!: InitialData | null;

  private miniMapScale = 0.3;
  private interactiveMapScale = 1.25;

  private miniMapScaleDefault = 0.3;
  private interactiveMapScaleDefault = 1.25;

  private isLinkInfoModalActive = false;

  private roomPortrayalImage = "";
  private roomPortrayalImageAStyle = "";
  private roomPortrayalImageBStyle = "";

  private jitsiLoaded = false;

  private hangup() {
    window.location.href =
      "https://partingle.com/thanks-for-joining-the-partingle-party/";
  }

  private changeIntMapScale(mult: number) {
    const max = this.interactiveMapScaleDefault * 10;
    const min = this.interactiveMapScaleDefault / 10;

    this.interactiveMapScale = Math.min(
      Math.max(this.interactiveMapScale * mult, min),
      max
    );
    this.updateInteractiveMapStyle();
  }

  private changeMinimapScale(mult: number) {
    const max = this.miniMapScaleDefault * 10;
    const min = this.miniMapScaleDefault / 10;

    this.miniMapScale = Math.min(Math.max(this.miniMapScale * mult, min), max);
    this.updateMinimMapStyle();
  }

  private updateRoomPortrayalImage(roomId: number) {
    this.roomPortrayalImage = UrlUtils.getRoomPortrayalImageUrlWithId(
      this.houseId,
      roomId
    );
  }

  private createPortrayalImageStyle(
    zindex: number,
    targetOpacity: number,
    time: string
  ) {
    let style = "width: 100%; height: 100%; position: absolute;";
    style += "top: 0; left: 0; z-index:" + zindex + "; ";
    style += "background-color: black; ";
    style += "background-image: " + "url(" + this.roomPortrayalImage + "); ";
    style += "background-repeat: no-repeat; ";
    style += "background-attachment: fixed; background-position: center; ";
    style += "background-size: cover;";
    style += "opacity: " + targetOpacity + ";";
    style += "transition: opacity " + time + ";";
    return style;
  }

  private updateMinimMapStyle() {
    const width = this.houseLayout?.size.width!;
    const height = this.houseLayout?.size.height!;

    const boarderOffset = 10;
    const left = (width * this.miniMapScale - width) / 2 + boarderOffset;
    const top = (height * this.miniMapScale - height) / 2 + boarderOffset;

    let style = "transform: scale(" + this.miniMapScale + ");";
    style += "left: " + left + "px;";
    style += "top: " + top + "px;";
    style += "width: " + width + "px;";
    style += "max-width: " + width + "px;";
    style += "height: " + height + "px;";
    style += "max-height: " + height + "px;";
    style += "position: absolute;";
    this.minimMapStyle = style;
  }

  private updateInteractiveMapStyle() {
    const leftTop = this.houseLayout?.rooms[this.currentRoomId].leftTop!;
    const rightBottom = this.houseLayout?.rooms[this.currentRoomId]
      .rightBottom!;

    const width = rightBottom.x - leftTop.x;
    const height = rightBottom.y - leftTop.y;

    const boarderOffset = 10;
    const left = (width * this.interactiveMapScale - width) / 2 + boarderOffset;
    const bottom =
      (height * this.interactiveMapScale - height) / 2 + boarderOffset;

    let style = "transform: scale(" + this.interactiveMapScale + ");";
    style += "left: " + left + "px;";
    style += "bottom: " + bottom + "px;";
    style += "width: " + width + "px;";
    style += "max-width: " + width + "px;";
    style += "height: " + height + "px;";
    style += "max-height: " + height + "px;";
    style += "position: absolute;";
    this.interactiveMapStyle = style;
  }

  private async roomChanged(
    newJitsiId: string | null,
    roomId: number,
    sleepbeforeUpdateInMs: number
  ) {
    console.log("roomChanged called", newJitsiId, roomId);

    // overlay new image and fade it in
    this.updateRoomPortrayalImage(roomId);
    const s = sleepbeforeUpdateInMs / 1000 + "s";
    this.roomPortrayalImageBStyle = this.createPortrayalImageStyle(2, 1, s);
    await GeneralUtils.sleep(sleepbeforeUpdateInMs);

    // new image is on top; start changing jitsi session etc. in the background
    this.jitsiLoaded = false;
    if (roomId != 0) {
      this.miniMapZoomStyle = "";
    }
    this.currentRoomId = roomId;
    this.jitsiSessionId = newJitsiId;
    this.updateInteractiveMapStyle();
    this.updateRoomProps();

    await this.waitUntilJitsiLoaded();

    // update A and move it back as the new background
    this.roomPortrayalImageAStyle = this.createPortrayalImageStyle(-1, 1, "0s");

    // fade out B
    this.roomPortrayalImageBStyle = this.createPortrayalImageStyle(2, 0, "1s");
    await GeneralUtils.sleep(1000);
    // move B to background
    this.roomPortrayalImageBStyle = this.createPortrayalImageStyle(
      -20,
      0,
      "0s"
    );
    // in parallel dim background slightly
    this.roomPortrayalImageAStyle = this.createPortrayalImageStyle(
      -1,
      0.3,
      "3s"
    );
  }

  private async waitUntilJitsiLoaded() {
    if (this.jitsiSessionId) {
      //wait max 5 sec
      for (let i = 0; i < 10 && !this.jitsiLoaded; i++) {
        await GeneralUtils.sleep(500);
      }
    }
  }

  private async joinTokenChanged(joinToken: string) {
    console.log("joinTokenChanged called", joinToken);
    if (this.recoverToken) {
      const pre = window.location.protocol + "//" + window.location.host + "/";
      this.joinLink =
        pre +
        this.$router.resolve({
          name: RouterNames.JOIN,
          params: { joinToken: joinToken },
        }).href;

      this.recoverLink =
        pre +
        this.$router.resolve({
          name: RouterNames.RECOVER,
          params: { recoverToken: this.recoverToken },
        }).href;

      this.isLinkInfoModalActive = true;
    }

    this.joinToken = joinToken;
  }
  private async houseLayoutLoaded(houseLayout: HouseLayout, houseId: number) {
    console.log("houseLayoutLoaded called", houseLayout, houseId);
    this.miniMapScale *= houseLayout.scale;
    this.miniMapScaleDefault = this.miniMapScale;
    this.interactiveMapScale *= houseLayout.scale;
    this.interactiveMapScaleDefault = this.interactiveMapScale;
    this.houseId = houseId;
    this.houseLayout = houseLayout;
    this.updateInteractiveMapStyle();
    this.updateMinimMapStyle();
    this.updateRoomProps();
  }

  private updateRoomProps() {
    this.roomProperties =
      this.houseLayout?.rooms[this.currentRoomId].properties || [];
  }

  private async mounted() {
    this.initialData = StateUtils.getInitialData();
    this.recoverToken = this.initialData?.houseRecoverToken;
  }
}
</script>

<style scoped lang="scss">
.roomProps {
  position: absolute;
  left: 0;
  top: 50%;
}

.miniMapZoom {
  background-color: #ffffffa8;
  border-radius: 0 0 1em 0;
  color: black;
  position: absolute;
  z-index: 1;
}

.interactiveMapZoom {
  background-color: #ffffffa8;
  border-radius: 0 1em 0 0;
  color: black;
  position: absolute;
  bottom: 0;
  z-index: 1;
}

.zoomIcon {
  cursor: pointer;
}
.zoomIcon:hover {
  color: rgba(0, 0, 0, 0.637);
}
</style>
