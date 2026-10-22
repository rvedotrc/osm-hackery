export type LL = readonly [number, number];

const teglværksbroen: [LL, LL] = [
  [55.6481193, 12.5509708],
  [55.6473302, 12.5500659],
]; // 104m
const xScale = Math.cos((55.6481193 / 180) * Math.PI);
const dx = (teglværksbroen[0][0] - teglværksbroen[1][0]) * xScale;
const dy = teglværksbroen[0][1] - teglværksbroen[1][1];
const d = Math.sqrt(dx ** 2 + dy ** 2); // 104?
const metersPerDegree = 104.2 / d;
console.log({ dx, dy, xScale, d, metersPerDegree });

const edgeOfSluseholmenN = [55.6459064, 12.5447636] as LL; // node 5974663272
const originInDegrees = edgeOfSluseholmenN;

// FIXME: scale
export const xyMetersToLatLongDegrees = ([x, y]: LL): LL => [
  (y / metersPerDegree) * xScale + originInDegrees[0],
  x / metersPerDegree + originInDegrees[1],
];

export const latLongDegreesToXyMeters = ([lat, long]: LL): LL => [
  ((long - originInDegrees[1]) * metersPerDegree) / xScale,
  (lat - originInDegrees[0]) * metersPerDegree,
];
