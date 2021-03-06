<template>
  <div>
    <div
      class="map"
      :class="{ selected: mapId == selectedMapId }"
      v-for="mapId in mapIdsToRender"
      :key="mapId"
      @click="selected(mapId)"
    >
      <img class="image" :src="imageUrls[mapId]" />
      <img class="image" :src="overlayUrls[mapId]" />

      <b-taglist attached class="recPeople" label="asdafsa">
        <b-tag type="is-dark">{{ prefNumbers[mapId] }}</b-tag>
        <b-tag type="is-info"
          ><b-icon icon="users" class="zoomIcon"></b-icon>
        </b-tag>
      </b-taglist>
    </div>
  </div>
</template>

<script lang="ts">
import { UrlUtils } from "@/utils/UrlUtils";
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
import { HouseLayout } from "@/utils/InteractiveMap/HouseLayoutInterfaces";

@Component
export default class MapSelect extends Vue {
  private mapIds = [0, 1, 2];
  private mapIdsToRender: number[] = [];
  @Prop()
  private selectedMapId = 0;
  private imageUrls: string[] = [];
  private overlayUrls: string[] = [];
  private prefNumbers: string[] = [];

  private selected(mapId: number) {
    this.$emit("selected", mapId);
  }

  private async mounted() {
    const promiseArray = [];
    for (const mapId of this.mapIds) {
      promiseArray.push(this.loadDataForMapId(mapId));
    }
    for (const promise of promiseArray) {
      await promise;
    }
    this.mapIdsToRender = this.mapIds;
  }

  private async loadDataForMapId(mapId: number) {
    const houseLayout: HouseLayout = (
      await axios.get(UrlUtils.getMapMetaUrlWithId(mapId))
    ).data;
    this.imageUrls[mapId] = UrlUtils.getMapImageUrlWithId(
      mapId,
      houseLayout.image
    );
    this.overlayUrls[mapId] = UrlUtils.getMapImageUrlWithId(
      mapId,
      houseLayout.overlay
    );
    this.prefNumbers[mapId] = houseLayout.recommendedGuests;
  }
}
</script>

<style scoped lang="scss">
.map {
  height: 300px;
  width: 300px;
  background-color: gray;
  display: inline-block;
  margin: 5px;
  border: transparent 3px solid;
  position: relative;
  cursor: pointer;
}

.selected {
  border: red 3px solid;
}

.image {
  position: absolute;
  height: auto;
  width: 100%;
}

.recPeople {
  position: absolute;
  bottom: 0;
}
</style>
