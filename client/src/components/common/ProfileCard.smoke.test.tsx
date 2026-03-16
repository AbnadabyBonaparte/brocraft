import { describe, it, expect } from "vitest";

describe("ProfileCard (smoke)", () => {
  it("module exports correctly", async () => {
    const mod = await import("./ProfileCard");
    expect(mod).toBeDefined();
    expect(typeof (mod.ProfileCard || mod.default)).toBe("function");
  });
});
