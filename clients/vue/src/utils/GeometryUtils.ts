import { Point } from "@/utils/InteractiveMap/HouseLayoutInterfaces";
import { DoorRenderData } from "@/utils/InteractiveMap/BuildDoorsSupport";

export class GeometryUtils {
  public static distance(a: Point, b: Point): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  public static middlePointOfDoor(door: DoorRenderData): Point {
    return {
      x: (door.left + door.left + door.width) / 2,
      y: (door.top + door.top + door.height) / 2,
    };
  }
}
