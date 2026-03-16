import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("appRouter (smoke)", () => {
  it("appRouter está definido e tem procedimentos esperados", () => {
    expect(appRouter).toBeDefined();
    expect(appRouter.system).toBeDefined();
    expect(appRouter.recipes).toBeDefined();
    expect(appRouter.gamification).toBeDefined();
    expect(appRouter.community).toBeDefined();
  });
});
