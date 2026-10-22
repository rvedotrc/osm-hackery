import { readFile } from "node:fs/promises";

import { isErrnoException } from "@blaahaj/gotcha/OSError";
import { doThrow } from "@blaahaj/gotcha/Throw";
import { Axios } from "axios";
import writeFile from "write-file-atomic";
import { treeifyError, type ZodType } from "zod";

import { parseXmlString } from "./saxParser.js";
import {
  MixedDoc,
  SChangesetDoc,
  SChangesetDownload,
  SNodeDoc,
  SRelationDoc,
  SWayDoc,
} from "./zodSchema.js";

export class HttpNotOKException extends Error {
  constructor(
    public readonly url: string,
    public readonly status: number,
  ) {
    super(`GET ${url} => ${status}`);
  }
}

export const cachedGet = async (url: string) => {
  const file = "var/cache/" + url.replaceAll(/[:/]/g, "_");
  const text = await readFile(file, "utf-8").catch((err) =>
    isErrnoException(err) && err.code === "ENOENT" ? undefined : doThrow(err),
  );
  if (text !== undefined) return text;

  console.log(`GET ${url}`);
  const axios = new Axios();
  const resp = await axios.get(url, {
    responseType: "text",
  });
  if (resp.status !== 200) throw new HttpNotOKException(url, resp.status);

  const body = resp.data as string;

  await writeFile(file, body, "utf-8");
  return body;
};

export const cachedXml = async <T>(
  url: string,
  zt: ZodType<T, unknown>,
): Promise<T> => {
  const body = await cachedGet(url);
  const doc = await parseXmlString(body);

  const r = await zt.safeParseAsync(doc);
  if (r.success) return r.data;

  console.error(`data from ${url} does not match schema:`);
  console.error(treeifyError(r.error));
  throw new Error("abort");
};

const makeGet =
  <N extends string, T>(
    type: N,
    schema: ZodType<T>,
    suffix = "",
  ): ((id: number | string) => Promise<T>) =>
  (id: number | string) =>
    cachedXml(
      `https://www.openstreetmap.org/api/0.6/${type}/${id}${suffix}`,
      schema,
    );

export const getChangesetDetail = (id: number) =>
  cachedXml(
    `https://www.openstreetmap.org/api/0.6/changeset/${id}/download`,
    SChangesetDownload,
  );

export const getChangeset = makeGet("changeset", SChangesetDoc);

export const getFull = (type: string, id: number | string) =>
  cachedXml(
    `https://www.openstreetmap.org/api/0.6/${type}/${id}/full`,
    MixedDoc,
  );

export const getNode = makeGet("node", SNodeDoc);
export const getNodeHistory = makeGet("node", SNodeDoc, "/history");
export const getNodeRelations = makeGet("node", SRelationDoc, "/relations");

export const getWay = makeGet("way", SWayDoc);
export const getWayHistory = makeGet("way", SWayDoc, "/history");
export const getWayRelations = makeGet("way", SRelationDoc, "/relations");

export const getRelation = makeGet("relation", SRelationDoc);
export const getRelationHistory = makeGet("relation", SRelationDoc, "/history");
export const getRelationRelations = makeGet(
  "relation",
  SRelationDoc,
  "/relations",
);

// export const getLatestFull = <T extends string>(type: T, id: number) =>
//   cachedXml(`https://www.openstreetmap.org/api/0.6/${type}/${id}/full`, TODO);

// export const getVersion = <T extends "node">(
//   type: T,
//   id: number,
//   version: number,
// ) =>
//   cachedXml(
//     `https://www.openstreetmap.org/api/0.6/${type}/${id}/${version}`,
//     SNodeDoc,
//   );

// https://www.openstreetmap.org/api/0.6/way/448265451/55
// https://www.openstreetmap.org/api/0.6/way/448265451/56
// https://www.openstreetmap.org/api/0.6/way/448265451/57

// https://www.openstreetmap.org/api/0.6/way/448265451
// https://www.openstreetmap.org/api/0.6/way/448265451/full
