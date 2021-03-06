<template>
  <div>
    <MiniMap
      v-if="houseLayout"
      :houseLayout="houseLayout"
      :houseId="houseId"
      :currentRoomId="currentRoomId"
      :style="minimMapStyle"
    ></MiniMap>

    <InteractiveMap
      @roomChanged="roomChanged"
      @joinTokenChanged="joinTokenChanged"
      @houseLayoutLoaded="houseLayoutLoaded"
      :autoAcceptNewUser="autoAcceptNewUser"
      :showRinging="showRinging"
      :style="interactiveMapStyle"
    ></InteractiveMap>

    <div class="devContainer">
      <p class="">Map dev view</p>
      <div>
        <b-checkbox v-model="autoAcceptNewUser">
          Auto accept new user
        </b-checkbox>
        <br />
        <b-checkbox v-model="showRinging"> Show Bell rings </b-checkbox>
        <br />
        <router-link
          v-if="joinToken"
          :to="{ name: routeJoin, params: { joinToken: joinToken } }"
          >JOIN LINK</router-link
        >
        <br />
        <router-link
          v-if="recoverToken"
          :to="{
            name: routeRecover,
            params: { recoverToken: recoverToken },
          }"
          >RECOVER LINK</router-link
        >
        <br />
        <router-link
          :to="{
            name: routeHost,
          }"
          >HOST LINK</router-link
        >
        <br />

        <b-field label="Mini Map Scale">
          <b-numberinput
            @input="updateMinimMapStyle"
            v-model="miniMapScale"
            min-step="0.01"
            step="0.1"
          >
          </b-numberinput>
        </b-field>
        <b-field label="Interactive Map Scale">
          <b-numberinput
            @input="updateInteractiveMapStyle"
            v-model="interactiveMapScale"
            min-step="0.01"
            step="0.1"
          >
          </b-numberinput>
        </b-field>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { InitialData } from "@/generated/api-axios";
import { RouterNames } from "@/utils/RouterNames";
import { Component, Vue } from "vue-property-decorator";
import InteractiveMap from "@/components/InteractiveMap.vue";
import MiniMap from "@/components/MiniMap.vue";
import { StateUtils } from "@/utils/StateUtils";
import { HouseLayout } from "@/utils/InteractiveMap/HouseLayoutInterfaces";

@Component({
  components: {
    InteractiveMap,
    MiniMap,
  },
})
export default class MapDev extends Vue {
  private routeJoin = RouterNames.JOIN;
  private routeRecover = RouterNames.RECOVER;
  private routeHost = RouterNames.HOST;
  private recoverToken: string | undefined = "";

  private joinToken: string | undefined = "";
  private autoAcceptNewUser = false;
  private showRinging = true;

  private houseLayout: HouseLayout | null = null;
  private houseId!: number;
  private currentRoomId = 0;

  private interactiveMapStyle = "display:none;";
  private minimMapStyle = "display:none;";

  private initialData!: InitialData | null;

  private miniMapScale = 0.3;
  private interactiveMapScale = 1;

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

  private async roomChanged(newJitsiId: string, roomId: number) {
    console.log("roomChanged called", newJitsiId, roomId);
    this.currentRoomId = roomId;
    this.updateInteractiveMapStyle();
  }
  private async joinTokenChanged(joinToken: string) {
    console.log("joinTokenChanged called", joinToken);
    this.joinToken = joinToken;
  }
  private async houseLayoutLoaded(houseLayout: HouseLayout, houseId: number) {
    console.log("houseLayoutLoaded called", houseLayout, houseId);
    this.miniMapScale *= houseLayout.scale;
    this.interactiveMapScale *= houseLayout.scale;
    this.houseId = houseId;
    this.houseLayout = houseLayout;
    this.updateInteractiveMapStyle();
    this.updateMinimMapStyle();
  }

  private async mounted() {
    this.initialData = StateUtils.getInitialData();
    this.recoverToken = this.initialData?.houseRecoverToken;
  }
}
</script>

<style scoped lang="scss">
.devContainer {
  width: 300px;
  margin: auto;
  margin-top: 20%;
}
</style>
