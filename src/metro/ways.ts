import assert from "node:assert";

import { getFull } from "../download.js";
import { isMember, isNd, isNode, isWay, type SRelation } from "../zodSchema.js";
import { tagOf } from "./tagOf.js";
import type { LineWithCode, Track } from "./types.js";

export const findRouteWays = async (
  line: LineWithCode,
  relationsOfRoute: SRelation[],
): Promise<Track[]> => {
  const wayIDs = relationsOfRoute
    .flatMap((r) => r.children)
    .filter(isMember)
    .filter((r) => r.attributes.type === "way")
    .map((r) => r.attributes.ref);

  const r: Track[] = [];

  for (const wayId of wayIDs) {
    console.log(`    way ${wayId}`);
    const items = (await getFull("way", wayId)).children;

    const ways = items.filter(isWay);
    const way = ways.find((w) => w.attributes.id === wayId);
    assert(way, `way #${wayId} not found in its own full listing`);

    if (tagOf(way, "railway")?.includes("platform")) continue;
    // dumpIt(way);

    const nodes = items.filter(isNode);
    const nodeIds = way.children.filter(isNd).map((nd) => nd.attributes.ref);
    const positions = nodeIds.map((nodeId) => {
      const node = nodes.find((n) => n.attributes.id === nodeId);
      assert(node);

      return [Number(node.attributes.lon), Number(node.attributes.lat)] as [
        number,
        number,
      ];
    });

    r.push({
      type: "Feature",
      properties: {
        color: line.v.color,
        stroke: line.v.color,
        line: line.k,
        segmentType: "solo",
      },
      geometry: {
        type: "LineString",
        coordinates: positions,
      },
    });
  }

  return r;
};
