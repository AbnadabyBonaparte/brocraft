import { describe, it, expect } from "vitest";

describe("FeaturesSection (smoke)", () => {
  it("module exports correctly", async () => {
    const mod = await import("./FeaturesSection");
    expect(mod).toBeDefined();
    expect(typeof mod.FeaturesSection).toBe("function");
  });
});
