import { readdir, readFile } from "node:fs/promises";

import { isLeft, thenToEither } from "@blaahaj/gotcha/Either";
import { treeifyError, type ZodError } from "zod";

import { parseXmlString } from "./saxParser.js";
import {
  SChangesetDoc,
  SChangesetDownload,
  SNodeDoc,
  SRelationDoc,
  SWayDoc,
} from "./zodSchema.js";

const schemaFromFilename = (name: string) => {
  if (name.match(/api_0.6_node_(\d+)$/)) return SNodeDoc;
  if (name.match(/api_0.6_node_(\d+)_history$/)) return SNodeDoc;

  if (name.match(/api_0.6_way_(\d+)$/)) return SWayDoc;
  if (name.match(/api_0.6_way_(\d+)_history$/)) return SWayDoc;

  if (name.match(/api_0.6_changeset_(\d+)$/)) return SChangesetDoc;
  if (name.match(/api_0.6_changeset_(\d+)_download$/))
    return SChangesetDownload;

  if (name.match(/api_0.6_relation_(\d+)$/)) return SRelationDoc;
};

const names = (await readdir(".")).filter((n) => n.startsWith("https___"));

for (const name of names) {
  const parsed = await parseXmlString(await readFile(name, "utf-8"));

  const schema = schemaFromFilename(name);
  if (!schema) {
    console.log(`WARN ${name}`);
    continue;
  }

  const result = await schema.parseAsync(parsed).then(...thenToEither);

  if (isLeft(result)) {
    console.log(`FAIL ${name}`);
    console.dir({ parsed }, { depth: 10 });
    console.dir(treeifyError(result.left as ZodError), { depth: 100 });
  } else {
    console.log(`PASS ${name}`);
    // console.dir({ decoded: result.right }, { depth: 10 });
  }
}
