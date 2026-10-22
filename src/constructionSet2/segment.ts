// import assert from "node:assert";
import type { Angle } from "./angle.js";
import { Point } from "./point.js";
import { Vector } from "./vector.js";

export class Segment {
  public static fromPointAndVector(
    reference: "start" | "midpoint" | "end",
    point: Point,
    vector: Vector,
  ): Segment {
    const p =
      reference === "start"
        ? ([point, point.translate(vector)] as const)
        : reference === "end"
          ? ([point.translate(vector.reverse()), point] as const)
          : // reference === "midpoint" ?
            ([
              point.translate(vector.mul(-0.5)),
              point.translate(vector.mul(+0.5)),
            ] as const);

    // assert(p);
    return new Segment(p[0], p[1]);
  }

  public static fromStartAndEnd(start: Point, end: Point): Segment {
    return new Segment(start, end);
  }

  public readonly vector: Vector;
  private constructor(
    public readonly start: Point,
    public readonly end: Point,
  ) {
    this.vector = Vector.fromAToB(start, end);
  }

  public get midpoint(): Point {
    return Point.midpoint(this.start, this.end);
  }

  public rotate(angle: Angle, center: "start" | "midpoint" | "end"): Segment {
    return Segment.fromPointAndVector(
      center,
      this[center],
      this.vector.rotate(angle),
    );
  }

  public get length(): number {
    return this.vector.length;
  }

  public reverse(): Segment {
    return Segment.fromStartAndEnd(this.end, this.start);
  }

  public translate(vector: Vector): Segment {
    return Segment.fromStartAndEnd(
      this.start.translate(vector),
      this.end.translate(vector),
    );
  }

  public scale(factor: number, center: "start" | "midpoint" | "end"): Segment {
    const v = this.vector.mul(factor);
    return Segment.fromPointAndVector(center, this[center], v);
  }
}

export const segment: {
  (
    reference: "start" | "midpoint" | "end",
    point: Point,
    vector: Vector,
  ): Segment;
  (a: Point, b: Point): Segment;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} = (a: any, b: any, c?: any) =>
  typeof a === "string"
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Segment.fromPointAndVector(a as any, b, c)
    : Segment.fromStartAndEnd(a, b);
