import { Point } from "./point.js";
import type { Segment } from "./segment.js";

export const lineIntersection = (line1: Segment, line2: Segment): Point => {
  const [[x1, y1], [x2, y2]] = [
    [line1.start.x, line1.start.y],
    [line1.end.x, line1.end.y],
  ];
  const [[x3, y3], [x4, y4]] = [
    [line2.start.x, line2.start.y],
    [line2.end.x, line2.end.y],
  ];

  const pXn = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
  const pXd = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  const pYn = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
  const pYd = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  const p = [pXn / pXd, pYn / pYd] as const;
  // const rx = p[0] / x2;
  // const ry = p[1] / y2;
  // console.log({ p, rx, ry });

  return new Point(p[0], p[1]);
};
