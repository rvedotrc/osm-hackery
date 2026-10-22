import assert from "node:assert";

import { doThrow } from "@blaahaj/gotcha/Throw";

import { getFull } from "../download.js";
import { isMember, isNode, type SRelation } from "../zodSchema.js";
import { alternateNames } from "./config.js";
import { tagOf } from "./tagOf.js";
import type { LineWithCode } from "./types.js";

const findStopIds = (relationsOfRoute: SRelation[]) =>
  relationsOfRoute
    .map((rel) =>
      rel.children
        .filter(isMember)
        .filter((m) =>
          ["stop", "stop_exit_only", "stop_entry_only"].includes(
            m.attributes.role,
          ),
        )
        .filter(
          (m) =>
            m.attributes.type === "node" ||
            doThrow(
              new Error(
                `'${m.attributes.role}' member is a '${m.attributes.type}', not a node`,
              ),
            ),
        )
        .map((m) => m.attributes.ref),
    )
    .flat();

export type FoundStop = {
  line: LineWithCode["k"];
  name: string;
  alternate_names: string[];
  lat: number;
  lon: number;
};

export const findStops = async (
  line: LineWithCode,
  relationsOfRoute: SRelation[],
): Promise<FoundStop[]> => {
  const stopIds = await findStopIds(relationsOfRoute);

  const things = await Promise.all(
    relationsOfRoute.map((rel) => getFull("relation", rel.attributes.id)),
  ).then((answers) => answers.map((a) => a.children).flat());

  const out: FoundStop[] = [];

  for (const stopId of stopIds) {
    console.log(`    stop ${stopId}`);
    const node = things.filter(isNode).find((n) => n.attributes.id === stopId);
    assert(node);

    // dumpIt(node);
    // const node = (await getNode(stopId)).children[0]!;
    // dumpIt(node, `stop`);

    const name =
      tagOf(node, "name") ?? doThrow(`node ${node.attributes.id} has no name`);

    const stop: FoundStop = {
      line: line.k,
      name,
      alternate_names: alternateNames[name as never] ?? [],
      lat: Number(
        node.attributes.lat ??
          doThrow(`node ${node.attributes.id} has no 'lat'`),
      ),
      lon: Number(
        node.attributes.lon ??
          doThrow(`node ${node.attributes.id} has no 'lon'`),
      ),
    };

    out.push(stop);
  }

  return out;
};
