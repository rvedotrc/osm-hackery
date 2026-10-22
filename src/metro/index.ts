import { basename } from "path";
import writeFile from "write-file-atomic";

import { getRelation } from "../download.js";
// import { dumpIt } from "../dumpIt.js";
import { isMember } from "../zodSchema.js";
import { masterRelations } from "./config.js";
import { mergeStationsWithSameId } from "./mergeStations.js";
import { withStableStationIds } from "./stableStationIds.js";
import { findStops } from "./stops.js";
import { tagOf } from "./tagOf.js";
import type { DataFile, LineWithCode, Station } from "./types.js";
import { findRouteWays } from "./ways.js";

const run = async () => {
  const dataFile: DataFile = {
    lines: [],
    stations: [],
    tracks: [],
  };

  await withStableStationIds(
    "var/state/stableStationIds.json",
    async ({ getIdForStation }) => {
      for (const [routeMasterCode, routeMasterRelationUrl] of Object.entries(
        masterRelations,
      )) {
        const routeMasterId = basename(routeMasterRelationUrl);
        console.log(`routeMaster ${routeMasterId}`);
        const routeMaster = (await getRelation(routeMasterId)).children[0]!;
        // dumpIt(routeMaster, "routeMaster");

        const line: LineWithCode = {
          k: `kbh${routeMasterCode}`,
          v: {
            name: tagOf(routeMaster, "name") ?? "?",
            color:
              tagOf(routeMaster, "colour") ??
              tagOf(routeMaster, "color") ??
              "#777",
            backgroundColor: "#fff", // what is this for?
            textColor: "#000", // what is this for?
            order: 0,
          },
        };
        dataFile.lines.push(line);

        const routeIds =
          routeMaster.children
            .filter(isMember)
            .filter((c) => c.attributes.type === "relation")
            .map((c) => c.attributes.ref) ?? [];

        for (const routeId of routeIds) {
          console.log(`  route ${routeId}`);
          const relationsOfRoute = (await getRelation(routeId)).children;

          // relationsOfRoute.forEach((i) => dumpIt(i));

          // for (const rel of relationsOfRoute) {
          //   const full = await getFull("relation", rel.attributes.id);
          //   dumpIt(full, `item of relationsOfRoute`);
          // }

          const foundStops = await findStops(line, relationsOfRoute);

          for (const s of foundStops) {
            const station: Station = {
              id: 0,
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [s.lon, s.lat],
              },
              properties: {
                id: "",
                name: s.name,
                // FIXME: returning an array of strings seems to cause a crash
                long_name: s.alternate_names[1],
                short_name: s.alternate_names[0],
                line: line.k,
              },
            };

            const id = await getIdForStation(station);
            station.id = id;
            station.properties.id = String(id);

            dataFile.stations.push(station);
          }

          dataFile.tracks.push(
            ...(await findRouteWays(line, relationsOfRoute)),
          );
        }
      }

      dataFile.stations = mergeStationsWithSameId(dataFile.stations);

      await writeFile("metro.json", JSON.stringify(dataFile) + "\n", "utf-8");
    },
  );
};

await run();
