import { describe, it, expect } from "vitest";
import { ROUTES } from "./routes";

describe("routes", () => {
  it("all main routes are defined", () => {
    expect(ROUTES.HOME).toBe("/");
    expect(ROUTES.RECIPES).toBe("/receitas");
    expect(ROUTES.HISTORY).toBe("/historico");
    expect(ROUTES.BADGES).toBe("/badges");
    expect(ROUTES.COMMUNITY).toBe("/comunidade");
    expect(ROUTES.UPGRADE_SUCCESS).toBe("/upgrade/sucesso");
    expect(ROUTES.UPGRADE_CANCEL).toBe("/upgrade/cancelado");
    expect(ROUTES.TERMS).toBe("/docs/terms");
    expect(ROUTES.PRIVACY).toBe("/docs/privacy");
    expect(ROUTES.NOT_FOUND).toBe("/404");
  });

  it("no duplicate path values", () => {
    const paths = Object.values(ROUTES);
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });

  it("all paths are non-empty strings starting with /", () => {
    for (const path of Object.values(ROUTES)) {
      expect(typeof path).toBe("string");
      expect(path.length).toBeGreaterThan(0);
      expect(path.startsWith("/")).toBe(true);
    }
  });

  it("SETTINGS and SHOP routes exist", () => {
    expect(ROUTES.SETTINGS).toBe("/settings");
    expect(ROUTES.SHOP).toBe("/shop");
  });

  it("route count is at least 12", () => {
    expect(Object.keys(ROUTES).length).toBeGreaterThanOrEqual(12);
  });
});
