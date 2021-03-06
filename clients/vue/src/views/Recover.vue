<template>
  <div>
    <h1>Join with recover token!</h1>

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
export default class Recover extends Vue {
  public async joinEvent(): Promise<void> {
    try {
      const houseApi = new HouseApi({ basePath: config.apiBasePath });
      const initialData = (
        await houseApi.houseRecoverGet(this.$route.params.recoverToken)
      ).data;
      StateUtils.setInitialData(initialData);
      this.$router.push({ name: RouterNames.PARTY });
    } catch (e) {
      this.$toast.error("Your recover link is not valid");
    }
  }
}
</script>

<style scoped lang="scss"></style>
