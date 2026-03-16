import { describe, it, expect } from "vitest";

describe("RankBadge (smoke)", () => {
  it("module exports correctly", async () => {
    const mod = await import("./RankBadge");
    expect(mod).toBeDefined();
    expect(typeof mod.RankBadge).toBe("function");
  });
});
