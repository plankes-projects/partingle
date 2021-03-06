<template>
  <div>
    <b-tooltip
      v-for="roomProperty in roomProperties"
      :key="roomProperty"
      :label="getRoomPropertyDesc(roomProperty)"
      position="is-right"
      multilined
    >
      <img class="roomProperty" :src="getRoomPropertyImage(roomProperty)" />
    </b-tooltip>
  </div>
</template>

<script lang="ts">
import { RoomProperties } from "@/utils/RoomProperties";
import { UrlUtils } from "@/utils/UrlUtils";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RoomPropertyViewer extends Vue {
  @Prop() private roomProperties!: string[];

  private getRoomPropertyImage(roomProperty: string): string {
    return UrlUtils.getRoomPropertyImage(roomProperty);
  }
  private getRoomPropertyDesc(roomProperty: string): string {
    switch (roomProperty) {
      case RoomProperties.TOILET:
        return "You are in the toilet. While in here, you can leave the computer and go to the toilet in real life.";
      case RoomProperties.LOBBY:
        return "You are at the entrance. Click on the door on the map to ring. Someone will come and let you in.";
      case RoomProperties.DRINKS:
        return "There are drinks in this room. You can leave the computer and grab some drinks if you want.";
      case RoomProperties.SMOKING:
        return "Smoking is allowed here. If you like, you can light your cigarette now in real life.";
      case RoomProperties.FOOD:
        return "There is food in this room. You can leave the computer and grab something to eat.";
      case RoomProperties.NO_VIDEO_CHAT:
        return "You can take a break from the party and leave the computer while in this room. Video chat is turned off.";
    }
    return roomProperty;
  }
}
</script>

<style scoped lang="scss">
.roomProperty {
  height: 5em;
  width: 5em;
}
</style>
