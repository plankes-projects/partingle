<template>
  <b-menu v-if="initalized" class="menu">
    <b-menu-list>
      <b-menu-item
        v-if="showAccept"
        class="menuEntry"
        icon="user-check"
        label="Accept"
        @click="onAccept"
      ></b-menu-item>

      <b-menu-item icon="caret-down" v-if="showAdmin" class="menuEntry">
        <template slot="label" slot-scope="props">
          Admin
          <b-icon
            class="is-pulled-right"
            :icon="props.expanded ? 'menu-down' : 'menu-up'"
          ></b-icon>
        </template>
        <b-menu-item
          v-if="!targetIsSuperAdmin"
          class="menuEntry"
          icon="user-times"
          label="Kick"
          @click="onKick"
        ></b-menu-item>
        <b-menu-item
          v-if="targetIsAdmin && !targetIsSuperAdmin"
          class="menuEntry"
          icon="user-minus"
          label="Remove Admin"
          @click="onRemoveAdmin"
        ></b-menu-item>
        <b-menu-item
          v-if="!targetIsAdmin"
          class="menuEntry"
          icon="user-plus"
          label="Make Admin"
          @click="onMakeAdmin"
        ></b-menu-item>
      </b-menu-item>
    </b-menu-list>
  </b-menu>
</template>

<script lang="ts">
import { HouseApi, User } from "@/generated/api-axios";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import config from "@/../config";

@Component
export default class AvatarClickMenu extends Vue {
  @Prop()
  private targetUser!: User;
  @Prop()
  private myUser!: User;
  @Prop()
  private myToken!: string;
  @Prop()
  private shown!: boolean;

  private initalized = false;

  private showAdmin = false;
  private showAccept = false;
  private targetIsAdmin = false;
  private targetIsSuperAdmin = false;
  private houseApi!: HouseApi;

  @Watch("shown")
  private shownChanged() {
    if (this.shown) {
      this.initialize();
    } else {
      this.initalized = false;
    }
  }

  private async initialize() {
    this.showAdmin = this.myUser.admin || false;
    this.showAccept = this.myUser.accepted! && !this.targetUser.accepted!;
    this.targetIsAdmin = this.targetUser.admin!;
    this.targetIsSuperAdmin = this.targetUser.superAdmin!;

    if (!this.showAdmin && !this.showAccept) {
      this.$emit("closeMenu");
      return;
    }
    this.initalized = true;
  }

  private async onKick() {
    this.houseApi.houseKickGet(this.myToken, this.targetUser.uuid!);
    this.$emit("closeMenu");
  }
  private async onAccept() {
    this.houseApi.houseAcceptGet(this.myToken, this.targetUser.uuid!);
    this.$emit("closeMenu");
  }
  private async onMakeAdmin() {
    this.houseApi.houseGiveAdminGet(this.myToken, this.targetUser.uuid!);
    this.$emit("closeMenu");
  }
  private async onRemoveAdmin() {
    this.houseApi.houseRemoveAdminGet(this.myToken, this.targetUser.uuid!);
    this.$emit("closeMenu");
  }

  private async mounted() {
    this.houseApi = new HouseApi({ basePath: config.apiBasePath });
  }
}
</script>

<style scoped lang="scss">
.menu {
  background-color: white;
  width: 10em;
  border: 1px black solid;
}

.menuEntry {
  text-align: left;
}
.icon {
  margin-right: 0.3em;
}
</style>
