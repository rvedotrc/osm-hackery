import { readFile } from "node:fs/promises";

import { isErrnoException } from "@blaahaj/gotcha/OSError";
import { doThrow } from "@blaahaj/gotcha/Throw";
import writeFile from "write-file-atomic";

import type { Station } from "./types.js";

type State = Record<string, number>;

export const withStableStationIds = async (
  filename: string,
  fn: (opts: {
    getIdForStation: (station: Station) => Promise<number>;
  }) => Promise<void>,
) => {
  const stableStationIds: State = await readFile(filename, "utf-8").then(
    (content) => JSON.parse(content),
    (error) =>
      isErrnoException(error) && error.code === "ENOENT" ? {} : doThrow(error),
  );

  const nextStableId = (): number =>
    (Object.values(stableStationIds)
      .map(Number)
      .toSorted((a, b) => a - b)
      .at(-1) ?? 0) + 1;

  const getIdForStation = async (station: Station): Promise<number> => {
    const names = [
      station.properties.name,
      station.properties.long_name,
      station.properties.short_name,
    ]
      .filter((t) => t !== undefined)
      .map((s) => `${s}\0${station.properties.line}`);

    const existingIds = names
      .map((name) => stableStationIds[name])
      .filter((t) => t !== undefined);
    const uniqueExistingIds = new Set(existingIds);

    if (uniqueExistingIds.size > 1) {
      throw new Error(
        `Station with names ${JSON.stringify(names)} has conflicting existing IDs ${JSON.stringify([...uniqueExistingIds])}`,
      );
    }

    const theId = [...uniqueExistingIds][0] ?? nextStableId();

    for (const name of names) {
      stableStationIds[name] = theId;
    }

    return theId;
  };

  await fn({ getIdForStation });

  await writeFile(filename, JSON.stringify(stableStationIds) + "\n", "utf-8");
};
