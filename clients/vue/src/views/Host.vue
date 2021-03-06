<template>
  <div class="content">
    <h1>Host a party!</h1>
    <h1>Select your prefered map</h1>
    <MapSelect
      @selected="mapSelected"
      :selectedMapId="selectedMapId"
    ></MapSelect>

    <h1>Click on an avatar to start</h1>
    <AvatarSelect @selected="joinEvent()"></AvatarSelect>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import config from "@/../config";
import { StateUtils } from "@/utils/StateUtils";
import { RouterNames } from "@/utils/RouterNames";
import { HouseApi } from "@/generated/api-axios";
import AvatarSelect from "@/components/AvatarSelect.vue";
import MapSelect from "@/components/MapSelect.vue";
import BrowserPrivilegeChecker from "@/components/BrowserPrivilegeChecker.vue";
import axios from "axios";
import { UrlUtils } from "@/utils/UrlUtils";
import { HouseLayout } from "@/utils/InteractiveMap/HouseLayoutInterfaces";

@Component({
  components: {
    AvatarSelect,
    MapSelect,
    BrowserPrivilegeChecker,
  },
})
export default class Host extends Vue {
  private selectedMapId = 0;
  private browserPrivilegesOk = false;
  private async mapSelected(selectedMapId: number) {
    this.selectedMapId = selectedMapId;
  }

  public async browserPrivilegesChanged(
    browserPrivilegesOk: boolean
  ): Promise<void> {
    this.browserPrivilegesOk = browserPrivilegesOk;
  }

  public async getNumOfRooms(): Promise<number> {
    const houseLayout: HouseLayout = (
      await axios.get(UrlUtils.getMapMetaUrlWithId(this.selectedMapId))
    ).data;
    const numOfRooms = Object.keys(houseLayout.rooms).length;
    return numOfRooms;
  }

  public async joinEvent(): Promise<void> {
    try {
      const numOfRooms = await this.getNumOfRooms();
      const houseApi = new HouseApi({ basePath: config.apiBasePath });
      const initialData = (
        await houseApi.houseCreateGet(this.selectedMapId, numOfRooms)
      ).data;
      StateUtils.setInitialData(initialData);
      this.$router.push({ name: RouterNames.PARTY });
    } catch (e) {
      console.error(e);
      this.$toast.error("Something went wrong at create...");
    }
  }
}
</script>

<style scoped lang="scss">
h1 {
  color: rgb(254, 179, 37);
}
</style>
