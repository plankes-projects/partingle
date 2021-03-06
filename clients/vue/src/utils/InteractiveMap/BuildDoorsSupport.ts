import { HouseLayout, Door, Point } from "./HouseLayoutInterfaces";
import { RoomProperties } from "../RoomProperties";
import { User, House } from "@/generated/api-axios";
import { GenericClientData } from "./InteractiveMapInterfaces";

enum DoorSymbolType {
  Arrow = 1,
  DoorBell,
  Occupied
}

export class BuildDoorsSupport {
  public static createRenderData(
    houseLayout: HouseLayout,
    houseData: House,
    user: User
  ): DoorRenderData[] {
    const doors: DoorRenderData[] = [];
    for (let i = 0; i < 100; i++) {
      const door = houseLayout.doors[i];
      const currentRoomId = user.location!.roomId!;
      if (!door) {
        break;
      }
      if (door.room1 == currentRoomId || door.room2 == currentRoomId) {
        const doorSize = 10; //the minimum size of a door.
        const width = Math.max(
          Math.abs(door.point1.x - door.point2.x),
          doorSize
        );
        const height = Math.max(
          Math.abs(door.point1.y - door.point2.y),
          doorSize
        );

        const leftDoorOff = width == 10 ? 5 : 0;
        const topDoorOff = height == 10 ? 5 : 0;

        const leftTop = houseLayout.rooms[currentRoomId].leftTop;
        const rightBottom = houseLayout.rooms[currentRoomId].rightBottom;
        const left =
          Math.min(door.point1.x, door.point2.x) - leftTop.x - leftDoorOff;
        const top =
          Math.min(door.point1.y, door.point2.y) - leftTop.y - topDoorOff;

        const targetRoomId =
          door.room1 == currentRoomId ? door.room2 : door.room1;
        const lockedData = this.getLockedData(
          houseLayout,
          user,
          targetRoomId,
          houseData
        );
        
        let style = "width: " + width + "px; height: " + height + "px;";
        style += " left: " + left + "px; top: " + top + "px;";
        style +=
          "background-color:" + (lockedData.locked ? "red" : "green") + ";";
        
        const doorSymbolInfo = this.calculateDoorSymbol(door, width, height, leftTop, rightBottom, lockedData.symbol);
        
        doors.push({
          id: i,
          style: style,
          targetRoomId: targetRoomId,
          lockedData: lockedData,
          hoverSymbolImg: doorSymbolInfo.hoverSymbolImg,
          hoverSymbolStyle: doorSymbolInfo.hoverSymbolStyle,
          left: left,
          top: top,
          width: width,
          height: height,
        });
      }
    }
    return doors;
  }

  private static calculateDoorSymbol(door: Door, doorWidth: number, doorHeight: number, leftTop: Point, rightBottom: Point, symbol: DoorSymbolType) {
    let hoverSymbolImg = "img/doors/";
    let symbolWidth = 0;
    let symbolHeight = 0;

    if (symbol == DoorSymbolType.Arrow) {
      const rightArrowWidth = 52;
      const rightArrowHeight = 40;
      
      const direction = this.calculateDoorOrientation(door, leftTop, rightBottom) 
      hoverSymbolImg += "door_arrow_" + direction + ".png";

      if (direction == "left" || direction == "right") {
        symbolWidth = rightArrowWidth;
        symbolHeight = rightArrowHeight;
      }
      else {
        symbolWidth = rightArrowHeight;
        symbolHeight = rightArrowWidth;
      }
    }
    else if (symbol == DoorSymbolType.DoorBell) {
      hoverSymbolImg += "doorbell.png";
      symbolWidth = 60;
      symbolHeight = 44;
    }
    else if (symbol == DoorSymbolType.Occupied) {
      hoverSymbolImg += "occupied.png";
      symbolWidth = 50;
      symbolHeight = 50;
    }
    else
      hoverSymbolImg = "";
    const scale = Math.min(doorWidth, doorHeight) / 28; //quick and dirty scale based on door size
    symbolHeight *= scale;
    symbolWidth *= scale;
    
    let hoverSymbolStyle = "position: absolute;";
    hoverSymbolStyle += "width: " + symbolWidth + "px; height: " + symbolHeight + "px;";
    hoverSymbolStyle += "max-width: " + symbolWidth + "px; max-height: " + symbolHeight + "px;";
    hoverSymbolStyle += "left: " + (doorWidth/2-symbolWidth/2) + "px;"
    hoverSymbolStyle += "top: " + (doorHeight/2-symbolHeight/2) + "px;";
    //hoverSymbolStyle += "width: 200%; height: 200%;";
    //hoverSymbolStyle += "top: 50%; left: 50%; transform: translate(-50%,-50%)";

    return {hoverSymbolImg: hoverSymbolImg, hoverSymbolStyle: hoverSymbolStyle}
  }

  private static calculateDoorOrientation(door: Door, roomLeftTop: Point, roomRightBottom: Point){
    const doorHorizontal = Math.abs(door.point1.x - door.point2.x);
    const doorVertical = Math.abs(door.point1.y - door.point2.y);
    const isVerticalDoor = doorVertical > doorHorizontal;

    if (isVerticalDoor) {
      const distanceToLeftWall = Math.abs(Math.min(door.point1.x, door.point2.x) - roomLeftTop.x);
      const distanceToRightWall = Math.abs(Math.max(door.point1.x, door.point2.x) - roomRightBottom.x);
      if (distanceToLeftWall < distanceToRightWall)
        return "left";
      else
        return "right";
    } else {
      const distanceToTopWall = Math.abs(Math.min(door.point1.y, door.point2.y) - roomLeftTop.y);
      const distanceToBottomWall = Math.abs(Math.max(door.point1.y, door.point2.y) - roomRightBottom.y);
      if (distanceToTopWall < distanceToBottomWall)
        return "up";
      else
        return "down";
    }
  }

  private static getLockedData(
    houseLayout: HouseLayout,
    user: User,
    targetRoomId: number,
    houseData: House
  ): LockedData {
    const currentRoomId = user.location!.roomId!;
    const sourceRoom = houseLayout.rooms[currentRoomId];
    if (
      (sourceRoom.properties || []).includes(RoomProperties.LOBBY) &&
      !user.accepted
    ) {
      return { locked: true, symbol: DoorSymbolType.DoorBell, reason: "Cannot leave lobby yet!" };
    }

    const targetRoom = houseLayout.rooms[targetRoomId];
    if (
      (targetRoom.properties || []).includes(RoomProperties.TOILET) &&
      this.countUsersInToiletRoom(targetRoomId, houseData) > 0
    ) {
      return { locked: true, symbol: DoorSymbolType.Occupied, reason: "Toilet full!" };
    }
    return { locked: false, symbol: DoorSymbolType.Arrow, reason: "" };
  }

  private static countUsersInToiletRoom(
    roomId: number,
    houseData: House
  ): number {
    const userTimeoutInSec = 60 * 5;
    return (
      houseData.users?.filter(
        (user) =>
          user.location?.roomId == roomId &&
          !this.isLongerThanXSecondsInRoom(user, userTimeoutInSec)
      ).length || 0
    );
  }

  private static isLongerThanXSecondsInRoom(
    user: User,
    seconds: number
  ): boolean {
    if (user.genericClientData) {
      const data: GenericClientData = JSON.parse(user.genericClientData);
      const sec =
        new Date().getTime() / 1000 -
        new Date(data.roomEntered).getTime() / 1000;
      return sec > seconds;
    }
    return true;
  }
}

export interface DoorRenderData {
  style: string;
  targetRoomId: number;
  id: number;
  lockedData: LockedData;
  hoverSymbolImg: string;
  hoverSymbolStyle: string;

  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LockedData {
  locked: boolean;
  symbol: DoorSymbolType;
  reason: string;
}
