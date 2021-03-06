<template>
  <div class="content">
    <h1>Welcome!<br />You have been invited to join a Partingle party!</h1>
    <div>
      Partingle is a videocall platform offering real party feeling for large
      groups. So act like on a real party.
    </div>
    <br />
    <div>
      <div>
        <b>Need to go to the toilet?</b> Don't just leave your computer, move to
        the toilet room on the map first.
      </div>
      <div><b>Need new drinks?</b> Move to the fridge room on the map.</div>
      <div><b>Graving to smoke?</b> The balcony has you covered.</div>
      <div>
        <b>Turn on some music!</b> On low volume it will not disturb you or
        others - even on speakers.
      </div>
    </div>
    <br />
    <div class="firstStop">
      <b>
        We recommend the fridge room as your first stop - to get some drinks!
      </b>
    </div>

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
@Component({
  components: {
    AvatarSelect,
  },
})
export default class Join extends Vue {
  public async joinEvent(): Promise<void> {
    try {
      const houseApi = new HouseApi({ basePath: config.apiBasePath });
      const initialData = (
        await houseApi.houseJoinGet(this.$route.params.joinToken)
      ).data;
      StateUtils.setInitialData(initialData);
      this.$router.push({ name: RouterNames.PARTY });
    } catch (e) {
      this.$toast.error("Your join link is not valid anymore.");
    }
  }
}
</script>

<style scoped lang="scss">
h1 {
  color: rgb(254, 179, 37);
}
.firstStop {
  color: rgb(122, 3, 153);
}

.content {
  padding-top: 1.5em;
}
</style>
