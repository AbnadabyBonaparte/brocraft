import { describe, it, expect } from "vitest";
import { TIER_LIMITS } from "./db";

describe("gamification (TIER_LIMITS)", () => {
  it("all tiers are defined: FREE, MESTRE, CLUBE_BRO", () => {
    expect(TIER_LIMITS.FREE).toBeDefined();
    expect(TIER_LIMITS.MESTRE).toBeDefined();
    expect(TIER_LIMITS.CLUBE_BRO).toBeDefined();
    expect(Object.keys(TIER_LIMITS)).toHaveLength(3);
  });

  it("each tier has dailyMessages and recipesAccess", () => {
    for (const tier of Object.values(TIER_LIMITS)) {
      expect(tier).toHaveProperty("dailyMessages");
      expect(tier).toHaveProperty("recipesAccess");
      expect(typeof tier.dailyMessages).toBe("number");
      expect(["basic", "advanced", "all"]).toContain(tier.recipesAccess);
    }
  });

  it("dailyMessages is ascending: FREE < MESTRE < CLUBE_BRO", () => {
    expect(TIER_LIMITS.FREE.dailyMessages).toBe(10);
    expect(TIER_LIMITS.MESTRE.dailyMessages).toBe(100);
    expect(TIER_LIMITS.CLUBE_BRO.dailyMessages).toBe(Infinity);
  });

  it("recipesAccess progresses: basic -> advanced -> all", () => {
    expect(TIER_LIMITS.FREE.recipesAccess).toBe("basic");
    expect(TIER_LIMITS.MESTRE.recipesAccess).toBe("advanced");
    expect(TIER_LIMITS.CLUBE_BRO.recipesAccess).toBe("all");
  });

  it("tier keys are uppercase and valid identifiers", () => {
    const keys = Object.keys(TIER_LIMITS);
    keys.forEach((k) => {
      expect(k).toBe(k.toUpperCase());
      expect(k.length).toBeGreaterThan(0);
    });
  });
});
