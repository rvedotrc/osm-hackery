import { doThrow } from "@blaahaj/gotcha/Throw";
import { basename } from "path";
import writeFile from "write-file-atomic";

import { getRelation } from "../download.js";
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

        const line: LineWithCode = {
          k: `kbh${routeMasterCode}`,
          v: {
            name:
              tagOf(routeMaster, "name") ??
              doThrow(`Route master ${routeMasterCode} has no name`),
            color: tagOf(routeMaster, "colour") ?? "#ff34a3",
            backgroundColor: "#ccc",
            textColor: "#fff",
            order: dataFile.lines.length + 1,
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
                id: 0,
                name: s.name,
                alternate_names: s.alternate_names,
                line: line.k,
              },
            };

            const id = await getIdForStation(station);
            station.id = id;
            station.properties.id = id;

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
