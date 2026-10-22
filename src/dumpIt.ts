import { type E, isElement } from "./saxParser.js";
import { isMember, isTag } from "./zodSchema.js";

export const dumpIt = (t: E, label?: string) => {
  const attrSequence = ["id", "version", "changeset"];
  const attrsAsString = Object.entries(t.attributes)
    .filter((pair): pair is [string, string] => pair[1] !== undefined)
    .map(([k, v]) => {
      let kPriority = attrSequence.indexOf(k);
      if (kPriority < 0) kPriority = attrSequence.length;

      return {
        k,
        kPriority,
        v,
      };
    })
    .toSorted((a, b) => a.kPriority - b.kPriority || a.k.localeCompare(b.k))
    .map((x) => ` ${x.k}=${x.v}`)
    .join("");

  console.log(`${label ? `[${label}] ` : ""}${t.elementName}${attrsAsString}`);

  const elementChildren = t.children
    .filter(isElement)
    .toSorted((a, b) => a.elementName.localeCompare(b.elementName));

  for (const c of elementChildren) {
    if (isMember(c)) {
      console.log(
        `  member '${c.attributes.role}' = ${c.attributes.type} ${c.attributes.ref}`,
      );
    } else if (isTag(c)) {
      console.log(`  tag ${c.attributes.k}=${c.attributes.v}`);
    } else {
      console.log(`  ${c.elementName} ${c.attributes.id}`);
    }
  }
};
