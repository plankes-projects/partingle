export interface Point {
  x: number;
  y: number;
}
export interface Room {
  leftTop: Point;
  rightBottom: Point;
  properties: Array<string>;
}
export interface Door {
  point1: Point;
  point2: Point;
  room1: number;
  room2: number;
}
export interface Size {
  width: number;
  height: number;
}
export interface HouseLayout {
  name: string;
  scale: number;
  recommendedGuests: string;
  userDiameter: number;
  image: string;
  overlay: string;
  size: Size;
  rooms: Array<Room>;
  doors: Array<Door>;
}
