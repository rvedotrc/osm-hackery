# osm-hackery : the metro-memory branch

## What is this?

It generates data for [adding København (Copenhagen) into the metro-memory game](https://github.com/benjamintd/metro-memory.com/pull/58).

## How do I run it?

```shell
# if you don't have asdf, install the tools in .tool-versions via some other means
asdf install

pnpm install
mkdir -p var/cache
node dist/src/metro/index.js
cp metro.json src/metro/types.ts $METRO_MEMORY_DIR/src/app/\(game\)/koebenhavn/data/
```
