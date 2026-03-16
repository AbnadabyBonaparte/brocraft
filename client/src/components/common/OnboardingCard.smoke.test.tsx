import { describe, it, expect } from "vitest";

describe.skip("OnboardingCard (smoke)", () => {
  it("module exports correctly", async () => {
    const mod = await import("./OnboardingCard");
    expect(mod).toBeDefined();
    expect(typeof (mod.OnboardingCard || mod.default)).toBe("function");
  });
});
