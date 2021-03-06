import { Door, Point } from "./HouseLayoutInterfaces";

export class UserSpawnSupport {
  public static calcUserInitPosition(
    roomWidth: number,
    roomHeight: number,
    leftTopOfRoom: Point,
    usedDoor: Door | null,
    userRadius: number
  ): Point {
    const result: Point = { x: 0, y: 0 };
    if (!usedDoor) {
      //spawn user random on 20%-80% of the map, so he is not spawned on a wall
      result.x = this.randomNumber(roomWidth * 0.2, roomWidth * 0.8);
      result.y = this.randomNumber(roomHeight * 0.2, roomHeight * 0.8);
    } else {
      const posX = (usedDoor.point1.x + usedDoor.point2.x) / 2;
      const posY = (usedDoor.point1.y + usedDoor.point2.y) / 2;
      result.x = posX - leftTopOfRoom.x;
      result.y = posY - leftTopOfRoom.y;

      this.dontSpawnUserRightOnDoor(
        roomWidth,
        roomHeight,
        result,
        usedDoor,
        userRadius
      );
    }

    return result;
  }

  private static dontSpawnUserRightOnDoor(
    roomWidth: number,
    roomHeight: number,
    userLocation: Point,
    door: Door,
    userRadius: number
  ): void {
    const doorHorizontal = Math.abs(door.point1.x - door.point2.x);
    const doorVertical = Math.abs(door.point1.y - door.point2.y);
    const isVerticalWall = doorVertical > doorHorizontal;
    if (isVerticalWall) {
      const userIsLeft = userLocation.x < roomWidth / 2;
      if (userIsLeft) {
        userLocation.x += userRadius;
      } else {
        userLocation.x -= userRadius;
      }
    } else {
      const userIsTop = userLocation.y < roomHeight / 2;
      if (userIsTop) {
        userLocation.y += userRadius;
      } else {
        userLocation.y -= userRadius;
      }
    }
  }

  private static randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
