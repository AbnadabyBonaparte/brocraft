import { describe, it, expect } from "vitest";
import {
  COMMUNITY_CATEGORY_VALUES,
  COMMUNITY_CATEGORIES,
  LEADERBOARD_TIMEFRAMES,
  VOTE_TYPES,
  COOKIE_NAME,
  ONE_YEAR_MS,
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
});
