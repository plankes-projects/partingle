<template>
  <div class="avatarSelect">
    <img
      v-for="avatarId in avatarIds"
      :key="avatarId"
      class="avatar"
      :src="getAvatarUrl(avatarId)"
      @click="start(avatarId)"
    />
  </div>
</template>

<script lang="ts">
import { StateUtils } from "@/utils/StateUtils";
import { UrlUtils } from "@/utils/UrlUtils";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class AvatarSelect extends Vue {
  private avatarIds: number[] = [];

  private start(avatarId: number) {
    StateUtils.setAvatarId(avatarId);
    this.$emit("selected");
  }

  private getAvatarUrl(id: number): string {
    return UrlUtils.getAvatarUrlWithId(id);
  }

  private async mounted() {
    const list = [];
    for (let i = 0; i <= 38; i++) {
      list.push(i);
    }
    this.avatarIds = list;
  }
}
</script>

<style scoped lang="scss">
.avatarSelect {
  max-width: 50%;
  margin: auto;
}

.avatar {
  height: 100px;
  cursor: pointer;
}
</style>
