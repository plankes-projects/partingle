<template>
  <div>
    <div :style="style" class="container map" @click="onMapClicked">
      <div
        v-for="door in doors"
        :key="door.id"
        :style="door.style"
        class="door"
        @click="onDoorClicked(door, $event)"
      >
        <img
          class="doorhoversymbol"
          :src="door.hoverSymbolImg"
          :style="door.hoverSymbolStyle"
        />
      </div>

      <div
        v-for="user in userToRender"
        :key="user.uuid"
        :ref="user.uuid"
        class="user"
        :style="getUserStyleWithUser(user)"
        @click="onUserClicked($event, user)"
      >
        <img
          class="avatar"
          :style="getAvatarStyle()"
          :src="user.avatarUrl"
          @click="onUserClicked($event, user)"
        />
      </div>
      <img
        class="clickmarker"
        :style="clickMarkerStyle"
        src="avatars/clickmarker_ring.png"
      />
    </div>

    <AvatarClickMenu
      v-if="initialData"
      :targetUser="avatarClickMenuUser"
      :myUser="user"
      :myToken="initialData.userToken"
      :shown="avatarClickMenuShown"
      :style="avatarClickMenuStyle"
      @closeMenu="closeAvatarClickMenu"
    ></AvatarClickMenu>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
import { User } from "@/generated/api-axios";
import { House, HouseApi, InitialData } from "@/generated/api-axios/api";
import config from "@/../config";
import { StateUtils } from "@/utils/StateUtils";
import { GeometryUtils } from "@/utils/GeometryUtils";
import { GeneralUtils } from "@/utils/GeneralUtils";
import { HouseLayout } from "@/utils/InteractiveMap/HouseLayoutInterfaces";
import { ErrorStrings } from "@/utils/ErrorStrings";
import {
  GenericClientData,
  UserRenderData,
} from "@/utils/InteractiveMap/InteractiveMapInterfaces";
import { UserSpawnSupport } from "@/utils/InteractiveMap/UserSpawnSupport";
import { SyncUserSupport } from "@/utils/InteractiveMap/SyncUserSupport";
import {
  BuildDoorsSupport,
  DoorRenderData,
} from "@/utils/InteractiveMap/BuildDoorsSupport";
import { UrlUtils } from "@/utils/UrlUtils";
import { RoomProperties } from "@/utils/RoomProperties";
import AvatarClickMenu from "@/components/AvatarClickMenu.vue";
import { ExceptionHandler } from "@/utils/ExceptionHandler";
import { BrowserIdentification } from "@/utils/BrowserIdentification";

@Component({
  components: {
    AvatarClickMenu,
  },
})
export default class InteractiveMap extends Vue {
  private joinToken: string | undefined = "";

  @Prop()
  private autoAcceptNewUser!: boolean;
  @Prop()
  private showRinging!: boolean;

  private houseLayout!: HouseLayout;
  private style = "";
  private doors: DoorRenderData[] = [];
  private usedDoorId = -1;
  private initialData: InitialData | null = null;
  private user: User = { location: { x: 0, y: 0, roomId: 0 } };
  private genericClientData: GenericClientData = {
    roomEntered: new Date(),
    avatarId: 0,
    triggeredRing: null,
  };

  private houseApi!: HouseApi;
  private houseData!: House;
  private userToRender: UserRenderData[] = [];

  private stopSyncLoop = false;

  private userDiameter = 30;
  private moveSpeedMultiplier = 1;
  private lastDoorBell: Date = new Date();
  private doorBellAudio: HTMLAudioElement | null = null;

  private avatarClickMenuUser: User | null = null;
  private avatarClickMenuStyle = "";
  private avatarClickMenuShown = false;

  private clickMarkerStyle =
    "position: absolute; display: block; z-index: -9999"; //this.getClickMarkerStyleHidden();

  // use this to determine if anything was clicked since the "automatic" movement to door was started
  private movementClickCounter = 0;

  private async mounted() {
    this.initialData = StateUtils.getInitialData()!;
    if (this.initialData == null) {
      throw new Error(ErrorStrings.NO_HOUSE);
    }
    this.genericClientData.avatarId = StateUtils.getAvatarId() || 0;
    this.houseApi = new HouseApi({ basePath: config.apiBasePath });
    await this.syncUsersCall();
    this.startSyncUserCalls();

    this.houseLayout = (
      await axios.get(UrlUtils.getMapMetaUrlWithId(this.houseData.houseId!))
    ).data;
    this.userDiameter = this.houseLayout.userDiameter;
    this.moveSpeedMultiplier = 30 / this.userDiameter;

    this.preloadBackgroundImages();
    this.preloadDoorbellData();
    this.$emit("houseLayoutLoaded", this.houseLayout, this.houseData.houseId);
    this.$emit(
      "roomChanged",
      this.getRoomToken(this.user.location!.roomId!),
      this.user.location!.roomId!,
      0
    );
    this.updateMap();
  }

  private async preloadDoorbellData() {
    let url = "sound/doorbell";
    if (BrowserIdentification.isFireFox() || BrowserIdentification.isOpera())
      url += ".ogg";
    else url += ".m4a";
    //await fetch(new Request(url, { mode: "no-cors" }));
    this.doorBellAudio = new Audio(url);
  }

  private async preloadBackgroundImages() {
    for (const roomId in this.houseLayout.rooms) {
      const url = UrlUtils.getRoomPortrayalImageUrlWithId(
        this.houseData.houseId!,
        parseInt(roomId)
      );
      await fetch(new Request(url, { mode: "no-cors" }));
    }
  }

  private closeAvatarClickMenu() {
    this.avatarClickMenuShown = false;
  }

  private async updateClickMarkerStyle(left: number, top: number) {
    const size = this.userDiameter / 2;
    let style = "position: absolute;";
    style +=
      "left: " + (left - size / 2) + "px; top: " + (top - size / 2) + "px;";

    let animationName = "clickMarkerAnimationA";
    if (this.clickMarkerStyle.includes(animationName))
      animationName = "clickMarkerAnimationB";
    style += "animation: " + animationName + " 0.5s linear 0s 1 forwards;";
    style += "width: " + size + "px;";
    style += "height: " + size + "px;";
    this.clickMarkerStyle = style;
  }

  private onUserClicked(event: MouseEvent, user: UserRenderData) {
    event.stopPropagation();
    if (this.avatarClickMenuShown) {
      this.avatarClickMenuShown = false;
      return;
    }

    if (user.uuid == this.initialData!.userUuid) {
      return;
    }

    const userObject =
      this.houseData.users?.find((u) => u.uuid == user.uuid) || null;
    if (userObject) {
      const userLoc = SyncUserSupport.getMapLocationOfUser(
        this,
        userObject.uuid!
      );
      if (userLoc) {
        this.avatarClickMenuUser = userObject;
        this.avatarClickMenuShown = true;

        const left = userLoc.x + this.userDiameter / 2;
        const top = userLoc.y - this.userDiameter * 2;
        let style = "margin-left: " + left + "px;";
        style += "margin-top: " + top + "px;";
        this.avatarClickMenuStyle = style;
      }
    }
  }

  private async onDoorClicked(door: DoorRenderData, event: MouseEvent) {
    const previousClickCounter = this.movementClickCounter;
    this.movementClickCounter += 1;

    event.stopPropagation();
    if (this.avatarClickMenuShown) {
      this.avatarClickMenuShown = false;
      return;
    }

    const ok = await this.handleMovementToDoorIfNeeded(door, event);
    if (!ok) return;
    // now make sure that the user has not clicked anywhere since then
    if (this.movementClickCounter != previousClickCounter + 1) return;

    if (this.isSwitchRoomAllowed(door)) {
      const sleep = 1000;
      this.$emit(
        "roomChanged",
        this.getRoomToken(door.targetRoomId),
        door.targetRoomId,
        sleep
      );
      await GeneralUtils.sleep(sleep);
      this.usedDoorId = door.id;
      this.user.location!.roomId = door.targetRoomId;
      this.genericClientData.roomEntered = new Date();
      this.updateMap();
    }
  }

  private distanceToCurrentUser(door: DoorRenderData): number | null {
    const doorMiddle = GeometryUtils.middlePointOfDoor(door);
    const userMiddle = SyncUserSupport.getMapLocationOfUser(
      this,
      this.initialData!.userUuid!
    );
    if (userMiddle == null) {
      return null;
    }
    return GeometryUtils.distance(doorMiddle, userMiddle);
  }

  private async handleMovementToDoorIfNeeded(
    door: DoorRenderData,
    event: MouseEvent
  ): Promise<boolean> {
    const ADDITIONAL_DELAY_UNTIL_DOOR_ACTIVATION = 0.5;
    const distance = this.distanceToCurrentUser(door);
    if (distance == null) {
      this.$toast.error("Could not get distance to door =(");
      return false;
    } else if (distance > 1.5 * this.userDiameter) {
      //this.$toast.error("Move closer to the door");
      const timeToDoor =
        ADDITIONAL_DELAY_UNTIL_DOOR_ACTIVATION +
        (distance / SyncUserSupport.RUN_SPEED) * this.moveSpeedMultiplier;
      const clickX = event.offsetX + door.left;
      const clickY = event.offsetY + door.top;
      this.handleMovementOnMapClicked(clickX, clickY);
      await GeneralUtils.sleep(timeToDoor * 1000);
      return true;
    }
    return true;
  }

  private isSwitchRoomAllowed(door: DoorRenderData): boolean {
    if (door.lockedData.locked && !this.user.accepted) {
      this.$toast.info("You just rang the doorbell!", {
        icon: "fas fa-bell",
      });
      if (this.doorBellAudio) this.doorBellAudio.play();
      this.genericClientData.triggeredRing = new Date();
      return false;
    }

    if (door.lockedData.locked) {
      this.$toast.error(door.lockedData.reason);
      return false;
    }
    return true;
  }

  private handleMovementOnMapClicked(clickX: number, clickY: number) {
    this.updateClickMarkerStyle(clickX, clickY);

    this.user.location!.x = clickX;
    this.user.location!.y = clickY;

    SyncUserSupport.updateCurrentLocation(
      this.userToRender,
      this,
      false,
      this.moveSpeedMultiplier
    );
  }

  private onMapClicked(event: MouseEvent) {
    this.movementClickCounter += 1;

    if (this.avatarClickMenuShown) {
      this.avatarClickMenuShown = false;
      return;
    }

    this.handleMovementOnMapClicked(event.offsetX, event.offsetY);
  }

  private async startSyncUserCalls() {
    while (!this.stopSyncLoop) {
      try {
        await this.syncUsersCall();
        if (this.autoAcceptNewUser) {
          await this.autoAcceptAll();
        }
        await this.buildDoors();
        await GeneralUtils.sleep(100);
      } catch (error) {
        if (error.message == ErrorStrings.CODE_401) {
          //since this runs async we cannot throw the exception to the handler. we have to pass it here.
          ExceptionHandler.handle(error, this);
          return;
        }
        await GeneralUtils.sleep(1000); // longer sleep in error case -> most likly we have connection issues
      }
    }
  }

  private async autoAcceptAll() {
    if (this.user.accepted) {
      this.houseData.users
        ?.filter((u) => !u.accepted)
        .forEach((u) =>
          this.houseApi.houseAcceptGet(this.initialData!.userToken!, u.uuid!)
        );
    }
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async syncUsersCall() {
    this.user.genericClientData = JSON.stringify(this.genericClientData);
    this.houseData = (
      await this.houseApi.houseSyncPost(this.initialData!.userToken!, this.user)
    ).data;
    if (this.joinToken != this.houseData.joinToken) {
      this.joinToken = this.houseData.joinToken;
      this.$emit("joinTokenChanged", this.joinToken);
    }
    this.mergeSelfUser();
    this.updateRenderDataWithTarget();
    this.notifyRingingifNeeded();
    SyncUserSupport.updateCurrentLocation(
      this.userToRender,
      this,
      false,
      this.moveSpeedMultiplier
    );
  }

  private notifyRingingifNeeded() {
    let mostRecentDoorBell: Date | null = null;
    for (const user of this.houseData.users!) {
      if (user.genericClientData) {
        const data: GenericClientData = JSON.parse(user.genericClientData);
        if (data && data.triggeredRing) {
          const ring = new Date(data.triggeredRing);
          if (mostRecentDoorBell == null || ring > mostRecentDoorBell) {
            mostRecentDoorBell = ring;
          }
        }
      }
    }
    if (
      this.user.accepted &&
      mostRecentDoorBell &&
      this.lastDoorBell < mostRecentDoorBell &&
      this.showRinging
    ) {
      this.$toast.info("Someone is at the door!", {
        icon: "fas fa-bell",
      });
      if (this.doorBellAudio) this.doorBellAudio.play();
    }
    if (mostRecentDoorBell) {
      this.lastDoorBell = mostRecentDoorBell;
    }
  }

  private mergeSelfUser() {
    const newUserData = this.houseData.users?.find(
      (u) => u.uuid == this.initialData!.userUuid
    )!;

    if (newUserData) {
      // this can happen when we lost connection for more than 1 min. then we wont get ourself with the sync call.
      // we will get ourself again after the next successful sync call.
      if (!this.user.accepted && newUserData.accepted) {
        this.$toast.info("You can now go in!", {
          icon: "fas fa-bell",
        });
      }
      this.user.accepted = newUserData.accepted;
      this.user.admin = newUserData.admin;
      this.user.superAdmin = newUserData.superAdmin;
    }
  }

  private updateRenderDataWithTarget() {
    this.userToRender = SyncUserSupport.updateRenderDataWithTarget(
      this.houseData,
      this.userToRender,
      this.initialData!.userUuid!,
      this.user.location!
    );
  }

  private getUserStyleWithUser(user: UserRenderData): string {
    let style = "width: " + this.userDiameter + "px;";
    style += "height: " + this.userDiameter / 2 + "px;";
    style += "background-image: url(" + user.baseUrl + ")";
    return style;
  }

  private getAvatarStyle(): string {
    const height = this.userDiameter + this.userDiameter * 0.25;
    const top = -height + this.userDiameter / 4;

    let style = "width: " + this.userDiameter + "px;";
    style += "height: " + height + "px;";
    style += "left: " + 0 + "px;";
    style += "top: " + top + "px;";
    return style;
  }

  private getRoomToken(roomId: number): string | null {
    const roomProps = this.houseLayout?.rooms[roomId].properties || [];
    if (roomProps.includes(RoomProperties.NO_VIDEO_CHAT)) {
      return null;
    }
    return this.houseData.rooms![roomId].token!;
  }

  private updateMap() {
    const room = this.houseLayout.rooms[this.user.location!.roomId!];
    const leftTop = room.leftTop;
    const rightBottom = room.rightBottom;

    const width = rightBottom.x - leftTop.x;
    const height = rightBottom.y - leftTop.y;

    const imageUrl = UrlUtils.getMapImageUrlWithId(
      this.houseData.houseId!,
      this.houseLayout.image
    );

    this.style = "background-image: url('" + imageUrl + "');";
    this.style += "width: " + width + "px; height: " + height + "px;";
    this.style +=
      "background-position: " + -leftTop.x + "px " + -leftTop.y + "px; ";

    this.buildDoors();
    const usedDoor =
      this.usedDoorId == -1 ? null : this.houseLayout.doors[this.usedDoorId];
    const pos = UserSpawnSupport.calcUserInitPosition(
      width,
      height,
      leftTop,
      usedDoor,
      this.userDiameter
    );
    this.user.location!.x = pos.x;
    this.user.location!.y = pos.y;
    this.updateRenderDataWithTarget();
    SyncUserSupport.updateCurrentLocation(
      this.userToRender,
      this,
      true,
      this.moveSpeedMultiplier
    );
  }

  private buildDoors() {
    this.doors = BuildDoorsSupport.createRenderData(
      this.houseLayout,
      this.houseData,
      this.user
    );
  }

  private beforeDestroy() {
    this.stopSyncLoop = true;
  }
}
</script>

// we need the same animation twice with the same contents // to toggle the
animation names to allow restarting the // animation at each click
<style type="text/css">
@keyframes wobblywalkA {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(0deg);
  }
  75% {
    transform: rotate(10deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
@keyframes wobblywalkB {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(0deg);
  }
  75% {
    transform: rotate(10deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
@keyframes clickMarkerAnimationA {
  0% {
    transform: scale(1);
  }
  99% {
    transform: scale(0);
  }
  100% {
    visibility: hidden;
  }
}
@keyframes clickMarkerAnimationB {
  0% {
    transform: scale(1);
  }
  99% {
    transform: scale(0);
  }
  100% {
    visibility: hidden;
  }
}
</style>

<style scoped lang="scss">
.clickmarker {
  pointer-events: none;
}

.door {
  position: absolute;
  cursor: pointer;
}

.door:hover {
  filter: brightness(85%);
}

div.door img.doorhoversymbol {
  display: none;
  pointer-events: none;
}

.door:hover img.doorhoversymbol {
  display: block;
}

.user:hover {
  filter: brightness(85%);
}

.map {
  cursor: pointer;
}

.user {
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Do not repeat the image */
  background-size: cover; /* Resize the background image to cover the entire container */
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.avatar {
  position: absolute;
}

.menu {
  position: absolute;
  left: 0;
  top: 0;
}
</style>
