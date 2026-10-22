import { inspect } from "node:util";

import * as z from "zod";

import type { E } from "./saxParser.js";

export const TODO = z.codec(
  z.unknown(),
  z.tuple([z.literal("UNKNOWN"), z.unknown()] as const),
  {
    decode: (v) => ["UNKNOWN", v] as ["UNKNOWN", unknown],
    encode: (v) => v[1],
  },
);

export const DUMP = z.codec(z.unknown(), z.never(), {
  decode: (v) => {
    const t = inspect(v, { depth: 10 });
    const error = new z.ZodError([]);
    error.issues.push({
      code: "custom",
      path: [],
      message: `DUMP requested. Data was: ${t}`,
    });
    throw error;
  },
  encode: () => null,
});

export const attributionEtc = {
  version: z.string(),
  generator: z.string(),
  copyright: z.string(),
  attribution: z.string(),
  license: z.string(),
};

export const osmOf = <T extends z.ZodType>(children: T) =>
  z.object({
    tag: z.literal("element"),
    elementName: z.literal("osm"),
    attributes: z.strictObject(attributionEtc),
    children: z.array(children),
  });

export const Tag = z.object({
  tag: z.literal("element"),
  elementName: z.literal("tag"),
  attributes: z.object({ k: z.string(), v: z.string() }),
  children: z.array(z.never()),
});
export type Tag = z.infer<typeof Tag>;

export const changeAttrs = {
  id: z.string(),
  visible: z.string(),
  version: z.string(),
  changeset: z.string(),
  timestamp: z.string(),
  user: z.string(),
  uid: z.string(),
};

export const SNode = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("node"),
  attributes: z.strictObject({
    ...changeAttrs,
    lat: z.string().optional(),
    lon: z.string().optional(),
  }),
  children: z.array(Tag),
});
export type SNode = z.infer<typeof SNode>;

export const SNodeRef = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("nd"),
  attributes: z.strictObject({
    ref: z.string(),
  }),
  children: z.array(z.never()),
});
export type SNodeRef = z.infer<typeof SNodeRef>;

export const SWay = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("way"),
  attributes: z.object(changeAttrs),
  children: z.array(z.union([SNodeRef, Tag])),
});
export type SWay = z.infer<typeof SWay>;

export const SMember = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("member"),
  attributes: z.strictObject({
    type: z.string(),
    ref: z.string(),
    role: z.string(),
  }),
  children: z.array(z.never()),
});
export type SMember = z.infer<typeof SMember>;

export const SRelation = z.object({
  tag: z.literal("element"),
  elementName: z.literal("relation"),
  attributes: z.strictObject(changeAttrs),
  children: z.array(z.union([SMember, Tag])),
});
export type SRelation = z.infer<typeof SRelation>;

export const SNodeDoc = osmOf(SNode);
export type SNodeDoc = z.infer<typeof SNodeDoc>;

export const SWayDoc = osmOf(SWay);
export type SWayDoc = z.infer<typeof SWayDoc>;

export const SRelationDoc = osmOf(SRelation);

export const MixedDoc = osmOf(
  z.strictObject({
    tag: z.literal("element"),
    elementName: z.string(),
    attributes: z.record(z.string(), z.string()),
    children: z.array(z.any()),
  }),
);

const createTypeGuard =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <K extends string, T extends E<K, any>>(type: K, _schema: z.ZodType<T>) =>
    (t: E): t is T =>
      t.elementName === type;

export const isWay = createTypeGuard("way", SWay);
export const isNode = createTypeGuard("node", SNode);
export const isRelation = createTypeGuard("relation", SRelation);
export const isNd = createTypeGuard("nd", SNodeRef);
export const isTag = createTypeGuard("tag", Tag);
export const isMember = createTypeGuard("member", SMember);

export const SCreatedThing = z.union([SNode, SWay, SRelation]);

export const SCreate = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("create"),
  attributes: z.record(z.never(), z.never()),
  children: z.array(SCreatedThing),
});

export const SModify = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("modify"),
  attributes: z.record(z.never(), z.never()),
  children: z.array(SCreatedThing),
});

export const SDelete = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("delete"),
  attributes: z.record(z.never(), z.never()),
  children: z.array(
    z.strictObject({
      tag: z.literal("element"),
      elementName: z.string(),
      attributes: z.strictObject(changeAttrs),
      children: z.array(z.never()),
    }),
  ),
});

export const SChangesetDownload = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("osmChange"),
  attributes: z.strictObject(attributionEtc),
  children: z.array(z.union([SCreate, SModify, SDelete])),
});

export const SChangeset = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("changeset"),
  attributes: z.strictObject({
    id: z.string(),
    created_at: z.string(),
    open: z.string(),
    comments_count: z.string(),
    changes_count: z.string(),
    created_count: z.string(),
    modified_count: z.string(),
    deleted_count: z.string(),
    closed_at: z.string(),
    min_lat: z.string(),
    min_lon: z.string(),
    max_lat: z.string(),
    max_lon: z.string(),
    uid: z.string(),
    user: z.string(),
  }),
  children: z.array(Tag),
});

export const SChangesetDoc = z.strictObject({
  tag: z.literal("element"),
  elementName: z.literal("osm"),
  attributes: z.strictObject(attributionEtc),
  children: z.array(SChangeset),
});
