export type XY = readonly [number, number];
export type LineSegment = readonly [XY, XY];

export const rotateAroundOrigin = ([x, y]: XY, radians: number): XY => [
  Math.cos(radians) * x + Math.sin(radians) * y,
  Math.sin(radians) * x - Math.cos(radians) * y,
];

export const lineIntersection = (
  line1: LineSegment,
  line2: LineSegment,
): XY => {
  const [[x1, y1], [x2, y2]] = line1;
  const [[x3, y3], [x4, y4]] = line2;

  const pXn = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
  const pXd = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  const pYn = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
  const pYd = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  const p = [pXn / pXd, pYn / pYd] as const;
  // const rx = p[0] / x2;
  // const ry = p[1] / y2;
  // console.log({ p, rx, ry });

  return p;
};
