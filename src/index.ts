// import * as gj from "geojson";
// import type { WritableDeep } from "type-fest";

// import { getNodeHistory, getWayHistory } from "./download.js";
// import { lineIntersection, type XY } from "./geo.js";

// const WAY_IDS = [448265451, 820408705] as readonly number[];
// const CHANGESET_IDS = [187654068, 188300153, 188464465] as readonly number[];

// // const wayHistories = new Map<string, readonly z.infer<typeof SWay>[]>();
// // const involvedNodeIds = new Set<string>();

// const gjDoc: gj.FeatureCollection = {
//   type: "FeatureCollection",
//   features: [],
// };

// for (const wayId of WAY_IDS) {
//   const r = await getWayHistory(wayId);
//   const wayVersions = r[1].osm;

//   for (const wv of wayVersions) {
//     if (!CHANGESET_IDS.includes(Number(wv[":@"].changeset))) continue;

//     console.log(
//       `way=${wayId} changeset=${wv[":@"].changeset} version=${wv[":@"].version}`,
//     );

//     const nodeIds = wv.way.filter((c) => "nd" in c).map((c) => c[":@"].ref);
//     // console.log(`  ${JSON.stringify(nodeIds)}`);

//     const colorIndex = gjDoc.features.length % 3;
//     const rgb = [`255,0,0`, `0,255,0`, `0,0,255`][colorIndex]!;

//     const coordinates: gj.Position[] = [];
//     const feat: gj.Feature = {
//       type: "Feature",
//       geometry: {
//         type: "LineString",
//         coordinates,
//       },
//       properties: {
//         label: `way=${wayId} changeset=${wv[":@"].changeset} version=${wv[":@"].version}`,
//         way: wayId,
//         changeset: wv[":@"].changeset,
//         version: wv[":@"].version,
//         stroke: `rgba(${rgb},1)`,
//       },
//     } as const;

//     for (const nodeId of nodeIds) {
//       const nodeHistory = await getNodeHistory(Number(nodeId));
//       const nodeVersions = nodeHistory[1].osm;

//       const node = nodeVersions.findLast(
//         (n) => Number(n[":@"].changeset) <= Number(wv[":@"].changeset),
//       )!;
//       const at = node[":@"];
//       console.log(
//         `  node=${nodeId} changeset=${at.changeset} version=${at.version} ${at.lat}N ${at.lon}E`,
//       );
//       coordinates.push([Number(at.lon!), Number(at.lat!)]);
//     }

//     const mls: gj.MultiLineString = {
//       type: "MultiLineString",
//       coordinates: [],
//     };
//     gjDoc.features.push(feat);
//     gjDoc.features.push({ type: "Feature", geometry: mls, properties: {} });

//     coordinates.forEach((p1, i) => {
//       if (i === 0) return;

//       const p0 = coordinates.at(i - 1)!;

//       const [degX0, degY0] = p0 as [number, number];
//       const [degX1, degY1] = p1 as [number, number];
//       const yScale = Math.cos((degY0 / 180) * Math.PI);

//       const degMidX = (degX0 + degX1) / 2;
//       const degMidY = (degY0 + degY1) / 2;

//       const dx = (degX1 - degX0) * yScale;
//       const dy = degY1 - degY0;
//       const theta = Math.atan2(dy, dx);
//       const l = Math.sqrt(dx ** 2 + dy ** 2) * 20;
//       const end0 = [
//         degMidX + (l * Math.cos(theta + Math.PI / 2)) / yScale,
//         degMidY + l * Math.sin(theta + Math.PI / 2),
//       ];
//       const end1 = [
//         degMidX + (l * Math.cos(theta - Math.PI / 2)) / yScale,
//         degMidY + l * Math.sin(theta - Math.PI / 2),
//       ];

//       mls.coordinates.push([end0, end1]);
//     });
//   }

//   console.log();
// }

// const enghave = [
//   [12.5560556, 55.6537564], // N
//   [12.5562439, 55.6536981], // S
// ] as const;

// const flip = [
//   [12.5542045, 55.6508213],
//   [12.5544783, 55.6508181],
// ] as const;

// const sluseholmen = [
//   [12.5461015, 55.6459464], // N
//   [12.5461186, 55.6458574], // S
// ] as const;

// for (const [[ax, ay], [bx, by]] of [sluseholmen, flip, enghave]) {
//   const yScale = Math.cos((by / 180) * Math.PI);

//   const mx = (ax + bx) / 2;
//   const my = (ay + by) / 2;
//   const mid = [mx, my];

//   const dx = (bx - ax) * yScale;
//   const dy = by - ay;
//   const theta = Math.atan2(dy, dx);
//   const l = Math.sqrt(dx ** 2 + dy ** 2);
//   console.log(JSON.stringify([l, theta + Math.PI / 2, mid]));
// }

// const separation = 0.00012; // distance between tracks
// const foo = [
//   [0.00008952159266080768, 0.10800103671577399, [12.54611005, 55.6459019]],
//   [0.00015452066827923978, 1.5500856425491056, [12.5543414, 55.6508197]],
//   [0.00012118301609273208, 1.0688981073812625, [12.55614975, 55.65372725]],
// ] as const;

// const [slusTheta, slusMid] = [foo[0][1], foo[0][2]];
// const [flipTheta, flipMid] = [foo[1][1], foo[1][2]];
// const [enghTheta, enghMid] = [foo[2][1], foo[2][2]];

// const extend = (pt: readonly [number, number], theta: number) => {
//   const yScale = Math.cos((pt[1] / 180) * Math.PI);
//   return [
//     pt[0] + (Math.cos(theta) * separation * 100) / yScale,
//     pt[1] + Math.sin(theta) * separation * 100,
//   ] as readonly [number, number];
// };

// const slusExt = extend(slusMid, slusTheta + Math.PI / 2);
// const flipExtS = extend(flipMid, flipTheta + Math.PI / 2);
// const flipExtE = extend(flipMid, flipTheta - Math.PI / 2);
// const enghExt = extend(enghMid, enghTheta - Math.PI / 2);

// const slusCenter = lineIntersection([slusMid, slusExt], [flipMid, flipExtS]);
// const enghCenter = lineIntersection([enghMid, enghExt], [flipMid, flipExtE]);

// const subtract = (from: XY, to: XY): XY => [to[0] - from[0], to[1] - from[1]];
// const lengthOfVector = (vec: XY) => Math.sqrt(vec[0] ** 2 + vec[1] ** 2);

// const arc = (
//   from: XY,
//   to: XY,
//   around: XY,
//   _radiusAdd: number,
// ): readonly XY[] => {
//   const r0 = lengthOfVector(subtract(from, around));
//   const r1 = lengthOfVector(subtract(to, around));
//   console.log({ r0, r1 });
//   return [];
// };

// const clone = <T>(d: T): WritableDeep<T> => JSON.parse(JSON.stringify(d));

// const g: gj.FeatureCollection = {
//   type: "FeatureCollection",
//   features: [
//     {
//       type: "Feature",
//       properties: {
//         label: "slusExt",
//       },
//       geometry: {
//         type: "Point",
//         coordinates: [...slusExt],
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         label: "flipExtS",
//       },
//       geometry: {
//         type: "Point",
//         coordinates: [...flipExtS],
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         label: "flipExtE",
//       },
//       geometry: {
//         type: "Point",
//         coordinates: [...flipExtE],
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         label: "enghExt",
//       },
//       geometry: {
//         type: "Point",
//         coordinates: [...enghExt],
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         label: "slusCenter",
//       },
//       geometry: {
//         type: "Point",
//         coordinates: [...slusCenter],
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         label: "enghCenter",
//       },
//       geometry: {
//         type: "Point",
//         coordinates: [...enghCenter],
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         label: "slusN",
//       },
//       geometry: {
//         type: "LineString",
//         coordinates: clone(arc(slusMid, flipMid, slusCenter, -separation / 2)),
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         label: "slusS",
//       },
//       geometry: {
//         type: "LineString",
//         coordinates: clone(arc(slusMid, flipMid, slusCenter, +separation / 2)),
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         label: "enghN",
//       },
//       geometry: {
//         type: "LineString",
//         coordinates: clone(arc(flipMid, enghMid, enghCenter, +separation / 2)),
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         label: "enghS",
//       },
//       geometry: {
//         type: "LineString",
//         coordinates: clone(arc(flipMid, enghMid, enghCenter, -separation / 2)),
//       },
//     },
//   ],
// };

// console.log(JSON.stringify(g));
// // console.log(JSON.stringify(gjDoc));
