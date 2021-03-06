import { UserRenderData, GenericClientData } from "./InteractiveMapInterfaces";
import { House, User, Location } from "@/generated/api-axios";
import { Point } from "./HouseLayoutInterfaces";
import { DomUtils } from "../DomUtils";
import { GeometryUtils } from "../GeometryUtils";
import { StateUtils } from "../StateUtils";
import { UrlUtils } from "../UrlUtils";

export class SyncUserSupport {
  public static readonly RUN_SPEED = 50;

  public static updateCurrentLocation(
    usersToRender: UserRenderData[],
    vue: Vue,
    mapChangedCall: boolean,
    moveSpeedMultiplier: number
  ) {
    if (mapChangedCall) {
      for (const userToRender of usersToRender) {
        userToRender.locationTargetChanged = true;
      }
    }
    for (const userToRender of usersToRender) {
      const element: any = DomUtils.getDomElementByRef(vue, userToRender.uuid);
      if (
        element &&
        (userToRender.locationTargetChanged || !element.style.left)
      ) {
        const userLoc = this.getMapLocationOfUser(vue, userToRender.uuid);
        if (userLoc) {
          //do we really need this if? does this really bring performence?
          const target = userToRender.locationTarget;
          const distance = GeometryUtils.distance(userLoc, target);
          const moveSpeed = distance / this.RUN_SPEED * moveSpeedMultiplier;
          const moveSpeedString = moveSpeed + "s";
          if (mapChangedCall) {
            element.style.transition = "";
            element.style.animation = "";
          }
          else {
            element.style.transition = "left " + moveSpeedString + " linear , top " + moveSpeedString + " linear ";
            // calculate animation duration and iterations to have roughly similar animation speeds
            const idealAnimationDuration = 1;
            const animationIterations = Math.ceil(moveSpeed / idealAnimationDuration);
            const animationDuration = moveSpeed / animationIterations;
            // toggle animation name (both animations do the same) to re-trigger it 
            // if the name stayed the same it would not be replayed by the browser
            let animationName = "wobblywalkA";
            if (element.style.animation.includes(animationName))
              animationName = "wobblywalkB";
            element.style.animation = animationName + " " + animationDuration + "s linear 0s " + animationIterations + " normal";
          }
          const style: CSSStyleDeclaration = window.getComputedStyle(element);
          element.style.left = target.x - parseInt(style.width) / 2 + "px";
          element.style.top = target.y - parseInt(style.height) / 2 + "px";
          element.style.opacity = 1;
          element.style.zIndex = 100 + target.y;
          userToRender.locationTargetChanged = false;
        }
      }
    }
  }

  public static getMapLocationOfUser(vue: Vue, userUuid: string): Point | null {
    const el = DomUtils.getDomElementByRef(vue, userUuid);
    if (el) {
      const style: CSSStyleDeclaration = window.getComputedStyle(el);
      return {
        x: parseInt(style.left) + parseInt(style.width) / 2,
        y: parseInt(style.top) + parseInt(style.height) / 2,
      };
    }
    return null;
  }

  public static updateRenderDataWithTarget(
    houseData: House,
    currentUsersToRender: UserRenderData[],
    myUuid: string,
    myTargetLocation: Location
  ): UserRenderData[] {
    const result = this.getAllOtherUsersInMyRoom(
      houseData,
      myTargetLocation.roomId!,
      myUuid
    ).map((user) => {
      const target = { x: user.location!.x!, y: user.location!.y! };
      const renderData: UserRenderData = {
        uuid: user.uuid!,
        locationTarget: target,
        locationTargetChanged: this.isLocationChanged(
          target,
          user.uuid!,
          currentUsersToRender
        ),
        baseUrl: "/avatars/base_blue.png",
        avatarUrl: this.getAvatarUrlWithUser(user),
      };
      return renderData;
    });

    const target = { x: myTargetLocation.x!, y: myTargetLocation.y! };
    result.push({
      uuid: myUuid!,
      locationTarget: target,
      locationTargetChanged: this.isLocationChanged(
        target,
        myUuid!,
        currentUsersToRender
      ),
      baseUrl: "/avatars/base_red.png",
      avatarUrl: UrlUtils.getAvatarUrlWithId(StateUtils.getAvatarId() || 0),
    });

    return result;
  }

  private static getAvatarUrlWithUser(user: User): string {
    if (user.genericClientData) {
      const data: GenericClientData = JSON.parse(user.genericClientData);
      if (data && data.avatarId) {
        return UrlUtils.getAvatarUrlWithId(data.avatarId);
      }
    }
    return UrlUtils.getAvatarUrlWithId(0);
  }

  private static isLocationChanged(
    target: Point,
    uuid: string,
    currentOtherUsersToRender: UserRenderData[]
  ): boolean {
    const oldRender = currentOtherUsersToRender.find((e) => e.uuid == uuid);
    const oldTarget = oldRender?.locationTarget;
    const changed = oldTarget?.x != target.x || oldTarget?.y != target.y;
    return changed;
  }

  private static getAllOtherUsersInMyRoom(
    houseData: House,
    myRoomId: number,
    myUuid: string
  ): User[] {
    return houseData
      .users!.filter((user) => user.uuid != myUuid)
      .filter((user) => user.location?.roomId == myRoomId);
  }
}
