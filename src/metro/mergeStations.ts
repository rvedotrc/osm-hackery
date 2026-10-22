import type { Station } from "./types.js";

export const mergeStationsWithSameId = (stations: Station[]): Station[] => {
  const g: Record<string, Station[]> = {};
  for (const station of stations) {
    const key = station.properties.id!;
    g[key] = [...(g[key] ?? []), station];
  }

  return Object.values(g).map((items) => {
    const template = items[0]!;

    const aggregate: Station = {
      ...template,
      geometry: {
        ...template.geometry,
        coordinates: [
          avg(items.map((item) => item.geometry.coordinates[0]!)),
          avg(items.map((item) => item.geometry.coordinates[1]!)),
        ],
      },
    };

    return aggregate;
  });
};

const avg = (data: number[]): number => {
  let n = 0;
  for (const x of data) n += x;
  return n / (data.length || 1);
};
