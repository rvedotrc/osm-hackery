import type { E } from "../saxParser.js";
import { isTag } from "../zodSchema.js";

export const tagOf = (thing: E<string, E>, key: string): string | undefined =>
  thing.children.filter(isTag).find((t) => t.attributes.k === key)?.attributes
    .v;
