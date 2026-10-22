import type { FoundStop } from "./stops.js";
import type { Station } from "./types.js";

export const aggregateByStop = (stops: FoundStop[]): FoundStop[] => {
  const g: Record<string, FoundStop[]> = {};
  for (const stop of stops) {
    const key = `${stop.name}\0${stop.line}`;
    g[key] = [...(g[key] ?? []), stop];
  }

  return Object.values(g).map((items) => {
    const aggregate: FoundStop = {
      ...items[0]!,
      lat: avg(items.map((t) => t.lat)),
      lon: avg(items.map((t) => t.lon)),
    };

    return aggregate;
  });
};

export const mergeStationsWithSameId = (stations: Station[]): Station[] => {
  const g: Record<string, Station[]> = {};
  for (const station of stations) {
    const key = station.properties.id;
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
