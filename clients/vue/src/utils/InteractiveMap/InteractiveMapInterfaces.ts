import { Point } from "./HouseLayoutInterfaces";

export interface UserRenderData {
  uuid: string;
  locationTarget: Point;
  locationTargetChanged: boolean;
  baseUrl: string;
  avatarUrl: string;
}

export interface GenericClientData {
  roomEntered: Date;
  avatarId: number;
  triggeredRing: Date | null;
}
