import type { FeatureCollection, Position } from "geojson";

import {
  Angle,
  REVERSE_RIGHT_ANGLE,
  RIGHT_ANGLE,
} from "./constructionSet2/angle.js";
import { Point } from "./constructionSet2/point.js";
import { Vector } from "./constructionSet2/vector.js";
import { type LL, xyMetersToLatLongDegrees } from "./coordinateSystems.js";

// S is further out than N, but only just
// const edgeOfSluseholmenN = [55.6459064, 12.5447636] as LL; // node 5974663272
// const edgeOfSluseholmenS = [55.64581, 12.5447859] as LL; // node 4452920837

// N is further out of station than S
// const edgeOfEnghaveBryggeN = [55.6536562, 12.5559605] as LL; // node 5974664488
// const edgeOfEnghaveBryggeS = [55.653621, 12.5561644] as LL; // node 11046896388

// Parameters given to desmos
const pS0: LL = [0, 0];
const pS1: LL = [9.758369834003133, 0.555158627073365];
const pE0: LL = [124.05808609912583, 139.9973341280464];
const pE1: LL = [129.0662265327569, 148.58601160995988];

// Parameters worked out in desmos
const fudge = 1.6;
const stage1DistanceMeters = 98 * fudge;
const stage2AngleDegrees = 85;
const stage2RadiusMeters = 570 * fudge;
const stage3DistanceMeters = 87 * fudge;
const stage4RadiusMeters = 380 * fudge;
const stage5DistanceMeters = 60 * fudge * 1.5;

const trackSeparationInMeters = 17.5; // guess

////

const collection: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

////

const draw = (offset: number) => {
  const arc = (
    c: Point,
    a0: Angle,
    a1: Angle,
    radius: number,
    step = new Angle("degrees", 2),
  ) => {
    const nSteps = Math.ceil((a1.degrees - a0.degrees) / step.degrees);
    const realStep = new Angle("degrees", (a1.degrees - a0.degrees) / nSteps);
    for (let a = a0; a.degrees < a1.degrees; a = a.add(realStep)) {
      if (a.degrees !== a0.degrees)
        pushPoint(c.translate(Vector.fromAngle(a, radius)), "");
    }
  };
  const arc2 = (
    c: Point,
    a0: Angle,
    a1: Angle,
    radius: number,
    step = new Angle("degrees", -2),
  ) => {
    const nSteps = Math.ceil((a1.degrees - a0.degrees) / step.degrees);
    const realStep = new Angle("degrees", (a1.degrees - a0.degrees) / nSteps);
    for (let a = a0; a.degrees > a1.degrees; a = a.add(realStep)) {
      if (a.degrees !== a0.degrees)
        pushPoint(c.translate(Vector.fromAngle(a, radius)), "");
    }
  };

  const points: Position[] = [];
  collection.features.push({
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: points,
    },
  });

  const pushPoint = (p: Point, _label: string) =>
    points.push([...xyMetersToLatLongDegrees([p.x, p.y])].toReversed());

  const startingAngle = new Angle(
    "radians",
    Math.atan2(pS1[1] - pS0[1], pS1[0] - pS0[0]),
  );
  const endingAngle = new Angle(
    "radians",
    Math.atan2(pE1[1] - pE0[1], pE1[0] - pE0[0]),
  );
  const requiredOverallRotation = endingAngle.sub(startingAngle);
  console.log({ startingAngle, endingAngle, requiredOverallRotation });

  const stage1Angle = startingAngle;
  const stage1Start = new Point(...pS1)
    .translate(Vector.fromAngle(stage1Angle.add(REVERSE_RIGHT_ANGLE), offset))
    .translate(Vector.fromAngle(new Angle("degrees", -135), 15));
  console.dir({ s1a: stage1Angle });
  pushPoint(stage1Start, "stage1Start");

  const stage12Junction = stage1Start.translate(
    Vector.fromAngle(stage1Angle, stage1DistanceMeters),
  );
  pushPoint(stage12Junction, "stage12Junction");

  const angleToStage2Centre = stage1Angle.add(RIGHT_ANGLE);
  console.dir({ angleToStage2Centre, RIGHT_ANGLE });
  const stage2Centre = stage12Junction.translate(
    Vector.fromAngle(angleToStage2Centre, stage2RadiusMeters + offset),
  );
  const stage2Rotation = new Angle("degrees", stage2AngleDegrees);
  // pushPoint(stage2Centre, "stage2Centre");
  const stage23Junction = stage12Junction.rotate(stage2Centre, stage2Rotation);
  arc(
    stage2Centre,
    Angle.fromVector(Vector.fromAToB(stage2Centre, stage12Junction)),
    Angle.fromVector(Vector.fromAToB(stage2Centre, stage23Junction)),
    stage2RadiusMeters + offset,
  );
  pushPoint(stage23Junction, "stage23Junction");

  const stage3Angle = stage1Angle.add(new Angle("degrees", stage2AngleDegrees));
  const stage34Junction = stage23Junction.translate(
    Vector.fromAngle(stage3Angle, stage3DistanceMeters),
  );
  pushPoint(stage34Junction, "stage34Junction");

  const stage4Centre = stage34Junction.translate(
    Vector.fromAngle(
      stage3Angle.add(REVERSE_RIGHT_ANGLE),
      stage4RadiusMeters - offset,
    ),
  );
  const stage4Rotation = requiredOverallRotation.sub(stage2Rotation);
  // pushPoint(stage4Centre, "stage4Centre");
  const stage45Junction = stage34Junction.rotate(stage4Centre, stage4Rotation);
  arc2(
    stage4Centre,
    Angle.fromVector(Vector.fromAToB(stage4Centre, stage34Junction)),
    Angle.fromVector(Vector.fromAToB(stage4Centre, stage45Junction)),
    stage4RadiusMeters - offset,
  );
  pushPoint(stage45Junction, "stage45Junction");

  const stage5Angle = stage3Angle.add(stage4Rotation);
  const stage5End = stage45Junction.translate(
    Vector.fromAngle(stage5Angle, stage5DistanceMeters),
  );
  pushPoint(stage5End, "stage5End");
};

draw(trackSeparationInMeters * +0.5);
draw(trackSeparationInMeters * -0.5);

// pushPoint(new Point(0, 0), "O");
// pushPoint(new Point(10, 0), "(10,0)");
// pushPoint(new Point(0, 10), "(0,10)");
// pushPoint(new Point(-10, 0), "(-10,0)");
// pushPoint(new Point(0, -10), "(0,-10)");

console.log(JSON.stringify(collection));
