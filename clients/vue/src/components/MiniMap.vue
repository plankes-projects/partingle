<template>
  <div
    v-if="firstRoomEntered"
    :style="getMinimapImageStyle()"
    class="container"
  >
    <img class="overlay" :src="getMinimapOverLayImage()" />

    <img
      v-for="roomId in coveredRoomIds"
      :key="roomId"
      src="/maps/room_cover.png"
      :style="getCoverStyleFOrRoomId(roomId)"
    />
  </div>
</template>

<script lang="ts">
import { HouseLayout } from "@/utils/InteractiveMap/HouseLayoutInterfaces";
import { UrlUtils } from "@/utils/UrlUtils";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class MiniMap extends Vue {
  @Prop() private houseLayout!: HouseLayout;
  @Prop() private houseId!: number;
  @Prop() private currentRoomId!: number;

  private coveredRoomIds: number[] = [];
  private firstRoomEntered = false;

  private getMinimapImageStyle() {
    const imageUrl = UrlUtils.getMapImageUrlWithId(
      this.houseId,
      this.houseLayout.image
    );
    let style = "background-image: url('" + imageUrl + "');";
    style +=
      "width: " +
      this.houseLayout.size.width +
      "px; height: " +
      this.houseLayout.size.height +
      "px;";

    return style;
  }

  private getMinimapOverLayImage() {
    const imageUrl = UrlUtils.getMapImageUrlWithId(
      this.houseId,
      this.houseLayout.overlay
    );
    return imageUrl;
  }

  private getCoverStyleFOrRoomId(roomId: number): string {
    //const room = this.houseLayout.rooms[roomId];
    const totalWidth = this.houseLayout.size.width;
    const totalHeight = this.houseLayout.size.height;

    const room = this.houseLayout.rooms[roomId];
    const leftTop = room.leftTop;
    const rightBottom = room.rightBottom;
    const width = rightBottom.x - leftTop.x;
    const height = rightBottom.y - leftTop.y;

    let style = "position: absolute;";
    style += "width: " + width + "px;";
    style += "height: " + height + "px;";
    style += "left: " + leftTop.x + "px;";
    style += "top: " + leftTop.y + "px;";

    return style;
  }

  @Watch("currentRoomId")
  private currentRoomChanged(): void {
    if (!this.firstRoomEntered) {
      this.initMiniMap();
      this.firstRoomEntered = true;
    }
    this.revealRoomWithId(this.currentRoomId);
    console.log("MINIMAP, REVEAL room id ", this.currentRoomId);
  }

  private initMiniMap(): void {
    for (const roomId in this.houseLayout.rooms) {
      this.coveredRoomIds.push(parseInt(roomId));
    }
    this.revealRoomWithId(0); //start/lobby room
  }

  private revealRoomWithId(roomId: number) {
    this.coveredRoomIds = this.coveredRoomIds.filter((e) => e != roomId);
  }
}
</script>

<style scoped lang="scss">
.overlay {
  width: 100%;
  height: 100%;
}
</style>
