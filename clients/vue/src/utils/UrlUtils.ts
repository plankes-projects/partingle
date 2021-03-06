import { Point } from "@/utils/InteractiveMap/HouseLayoutInterfaces";
import { DoorRenderData } from "@/utils/InteractiveMap/BuildDoorsSupport";

export class UrlUtils {
  public static getAvatarUrlWithId(avatarId: number): string {
    return "/avatars/" + avatarId + ".png";
  }
  public static getMapMetaUrlWithId(layoutId: number): string {
    return "/maps/" + layoutId + "/meta.json";
  }
  public static getMapImageUrlWithId(
    layoutId: number,
    imageFromLayoutData: string
  ): string {
    return "/maps/" + layoutId + "/" + imageFromLayoutData;
  }
  public static getRoomPortrayalImageUrlWithId(layoutId: number, roomId: number): string {
    return "/maps/" + layoutId + "/" + roomId + ".jpg";
  }
  public static getRoomPropertyImage(roomProperty: string): string {
    return "/maps/properties/" + roomProperty + ".png";
  }
}
