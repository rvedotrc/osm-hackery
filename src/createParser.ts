import { XMLParser } from "fast-xml-parser";

export default () =>
  new XMLParser({
    // document: { doc: [ a "?xml" node, then the root element node ] }

    // text node: { '#text': a_string }

    // comment node: { '$comment': [ { '#text': ' foo ' } ] } (uses commentPropName)
    commentPropName: "$comment",

    // CDATA node: { '$cdata': [ { '#text': '<text><content>' } ] } (uses cdataPropName)
    cdataPropName: "$cdata",

    // element node: { [tagName]: [ NODES... ] }
    preserveOrder: true,

    // element node: { [tagName]: [ NODES... ], ":@": { [key]: value, ... } }
    ignoreAttributes: false,
    attributeNamePrefix: "",
    // attributesGroupName: ... (can't be combined with preserveOrder: true)
  });
