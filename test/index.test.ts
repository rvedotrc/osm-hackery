import assert from "node:assert";
import { describe, it } from "node:test";

await describe("Hello, world!", async () => {
  await it("runs", () => {
    assert(true);
  });
});
