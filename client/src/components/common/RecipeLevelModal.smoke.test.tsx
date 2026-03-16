import { describe, it, expect } from "vitest";

describe("RecipeLevelModal (smoke)", () => {
  it("module exports correctly", async () => {
    const mod = await import("./RecipeLevelModal");
    expect(mod).toBeDefined();
    expect(typeof (mod.RecipeLevelModal || mod.default)).toBe("function");
  });
});
