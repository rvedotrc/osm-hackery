import { Point } from "./point.js";
import { Vector } from "./vector.js";

export const TAU = Math.PI * 2;

export class Angle {
  public readonly degrees: number;
  public readonly radians: number;

  public static fromVector(v: Vector): Angle {
    return new Angle("radians", Math.atan2(v.y, v.x));
  }

  public static fromVectorToVector(from: Vector, to: Vector): Angle {
    const a1 = Angle.fromVector(from);
    const a2 = Angle.fromVector(to);
    return new Angle("degrees", a2.degrees - a1.degrees);
  }

  public static AOB(a: Point, o: Point, b: Point) {
    const fromVector = Vector.fromAToB(o, a);
    const toVector = Vector.fromAToB(o, b);
    return this.fromVectorToVector(fromVector, toVector);
  }

  constructor(unit: "degrees" | "radians", amount: number) {
    if (unit === "degrees") {
      this.degrees = amount;
      this.radians = (this.degrees / 360) * TAU;
    } else if (unit === "radians") {
      this.radians = amount;
      this.degrees = (this.radians / TAU) * 360;
    } else {
      throw new Error("Unreachable");
    }
  }

  public sin(): number {
    return Math.sin(this.radians);
  }

  public cos(): number {
    return Math.cos(this.radians);
  }

  public tan(): number {
    return Math.tan(this.radians);
  }

  public mul(n: number): Angle {
    return new Angle("degrees", this.degrees * n);
  }

  public add(other: Angle): Angle {
    return new Angle("degrees", this.degrees + other.degrees);
  }

  // convenience method
  public sub(other: Angle): Angle {
    return new Angle("degrees", this.degrees - other.degrees);
  }
}

export const RIGHT_ANGLE = new Angle("degrees", 90);
export const REVERSE_RIGHT_ANGLE = new Angle("degrees", -90);

export const angle: {
  (unit: "degrees" | "radians", amount: number): Angle;
  (a: Point, o: Point, b: Point): Angle;
  (vector: Vector): Angle;
  (fromVector: Vector, toVector: Vector): Angle;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} = (a: any, b?: any, c?: any) =>
  typeof a === "string"
    ? new Angle(a as never, b)
    : a instanceof Point
      ? Angle.AOB(a, b, c)
      : b
        ? Angle.fromVectorToVector(a, b)
        : Angle.fromVector(a);
