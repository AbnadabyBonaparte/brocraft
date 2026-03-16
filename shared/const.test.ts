import { describe, it, expect } from "vitest";
import {
  COMMUNITY_CATEGORY_VALUES,
  COMMUNITY_CATEGORIES,
  LEADERBOARD_TIMEFRAMES,
  VOTE_TYPES,
  COOKIE_NAME,
  ONE_YEAR_MS,
  AXIOS_TIMEOUT_MS,
  UNAUTHED_ERR_MSG,
  NOT_ADMIN_ERR_MSG,
} from "./const";

describe("shared/const (dados receitas, badges, comunidade)", () => {
  it("COMMUNITY_CATEGORY_VALUES contém categorias esperadas", () => {
    expect(COMMUNITY_CATEGORY_VALUES).toContain("CERVEJA");
    expect(COMMUNITY_CATEGORY_VALUES).toContain("FERMENTADOS");
    expect(COMMUNITY_CATEGORY_VALUES).toContain("LATICINIOS");
    expect(COMMUNITY_CATEGORY_VALUES).toContain("CHARCUTARIA");
    expect(COMMUNITY_CATEGORY_VALUES).toContain("DICA");
    expect(COMMUNITY_CATEGORY_VALUES).toContain("OUTRO");
    expect(COMMUNITY_CATEGORY_VALUES).toHaveLength(6);
  });

  it("COMMUNITY_CATEGORIES tem value e label para cada categoria", () => {
    expect(COMMUNITY_CATEGORIES).toHaveLength(6);
    for (const c of COMMUNITY_CATEGORIES) {
      expect(c).toHaveProperty("value");
      expect(c).toHaveProperty("label");
      expect(COMMUNITY_CATEGORY_VALUES).toContain(c.value);
    }
  });

  it("LEADERBOARD_TIMEFRAMES contém ALL, DAY, WEEK, MONTH", () => {
    expect(LEADERBOARD_TIMEFRAMES).toEqual(["ALL", "DAY", "WEEK", "MONTH"]);
  });

  it("VOTE_TYPES contém LIKE, FIRE, STAR", () => {
    expect(VOTE_TYPES).toEqual(["LIKE", "FIRE", "STAR"]);
  });

  it("COOKIE_NAME e ONE_YEAR_MS estão definidos", () => {
    expect(COOKIE_NAME).toBe("app_session_id");
    expect(ONE_YEAR_MS).toBe(1000 * 60 * 60 * 24 * 365);
  });

  it("categories are valid for content (cerveja, fermentados, etc.)", () => {
    const valid = ["CERVEJA", "FERMENTADOS", "LATICINIOS", "CHARCUTARIA", "DICA", "OUTRO"];
    expect(COMMUNITY_CATEGORY_VALUES).toEqual(valid);
  });

  it("each COMMUNITY_CATEGORIES entry has value in COMMUNITY_CATEGORY_VALUES", () => {
    const values = new Set(COMMUNITY_CATEGORY_VALUES);
    COMMUNITY_CATEGORIES.forEach((c) => expect(values.has(c.value)).toBe(true));
  });

  it("AXIOS_TIMEOUT_MS is a positive number", () => {
    expect(AXIOS_TIMEOUT_MS).toBe(30_000);
  });

  it("UNAUTHED_ERR_MSG and NOT_ADMIN_ERR_MSG are non-empty", () => {
    expect(UNAUTHED_ERR_MSG.length).toBeGreaterThan(0);
    expect(NOT_ADMIN_ERR_MSG.length).toBeGreaterThan(0);
  });

  it("VOTE_TYPES has exactly 3 types", () => {
    expect(VOTE_TYPES).toHaveLength(3);
  });

  it("LEADERBOARD_TIMEFRAMES has ALL first", () => {
    expect(LEADERBOARD_TIMEFRAMES[0]).toBe("ALL");
  });

  it("COMMUNITY_CATEGORY_VALUES is readonly tuple", () => {
    expect(COMMUNITY_CATEGORY_VALUES[0]).toBe("CERVEJA");
    expect(COMMUNITY_CATEGORY_VALUES[5]).toBe("OUTRO");
  });

  it("ONE_YEAR_MS is roughly 31.5e9 ms", () => {
    expect(ONE_YEAR_MS).toBeGreaterThan(31_000_000_000);
    expect(ONE_YEAR_MS).toBeLessThan(32_000_000_000);
  });
});
