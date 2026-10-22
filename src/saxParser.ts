import sax from "sax";

export type E<
  T extends string = string,
  C extends E | unknown = unknown,
  A extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
> = {
  readonly tag: "element";
  readonly elementName: T;
  readonly attributes: A;
  readonly children: C[];
};

export const isElement = (t: unknown): t is E =>
  t !== null && typeof t === "object" && "tag" in t && t.tag === "element";

export const parseXmlString = (t: string) =>
  new Promise<E>((resolve, reject) => {
    const parser = sax.parser(true);

    const q: E[] = [
      {
        tag: "element",
        elementName: "(root)",
        attributes: {},
        children: [],
      },
    ];

    parser.onopentag = (tag) => {
      const n: E = {
        tag: "element",
        elementName: tag.name,
        // ignore "qualified attributes"
        attributes: tag.attributes as Record<string, string>,
        children: [],
      };

      q.at(-1)!.children!.push(n);
      q.push(n);
    };

    parser.onclosetag = (tagName) => {
      const top = q.pop();

      if (!top) return reject(new Error(`No 'top' onclosetag`));
      if (top.elementName !== tagName)
        return reject(
          new Error(`${tagName} closed but ${top.elementName} was expected`),
        );

      //   if (top.children!.length === 0) {
      //     delete (top as Writable<E>).children;
      //   }
    };

    parser.onend = () => {
      if (q.length !== 1)
        return reject(
          new Error(`At end, stack size is ${q.length}, expected 1`),
        );

      const children = q.pop()!.children;

      if (children?.length !== 1)
        return reject(
          new Error(
            `Expected 1 document element, found ${children?.length ?? 0}`,
          ),
        );

      resolve(children![0]! as E);
    };

    parser.onerror = (error) => reject(error);

    parser.write(t).close();
  });
