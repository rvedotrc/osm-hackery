import { Angle } from "./angle.js";
import { Point } from "./point.js";

export class Vector {
  public static fromAToB(a: Point, b: Point): Vector {
    return new Vector(b.x - a.x, b.y - a.y);
  }

  public static fromAngle(a: Angle, length = 1): Vector {
    return new Vector(length * a.cos(), length * a.sin());
  }

  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  public add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  public mul(n: number): Vector {
    return new Vector(this.x * n, this.y * n);
  }

  public reverse(): Vector {
    return new Vector(-this.x, -this.y); // aka this.mul(-1)
  }

  public get length(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  public rotate(a: Angle): Vector {
    return new Vector(
      this.x * a.cos() - this.y * a.sin(),
      this.x * a.sin() + this.y * a.cos(),
    );
  }
}

export const vector: {
  (a: Point, b: Point): Vector;
  (angle: Angle, length?: number): Vector;
  (x: number, y: number): Vector;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} = (a: any, b?: any) =>
  a instanceof Point
    ? Vector.fromAToB(a, b)
    : a instanceof Angle
      ? Vector.fromAngle(a, b ?? 1)
      : new Vector(a, b);
