import { Angle } from "./angle.js";
import { Vector } from "./vector.js";

export class Point {
  public static midpoint(a: Point, b: Point): Point {
    return new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
  }

  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  public translate(v: Vector): Point {
    return new Point(this.x + v.x, this.y + v.y);
  }

  public rotate(c: Point, a: Angle): Point {
    return c.translate(Vector.fromAToB(c, this).rotate(a));
  }
}

export const point = (x: number, y: number) => new Point(x, y);
