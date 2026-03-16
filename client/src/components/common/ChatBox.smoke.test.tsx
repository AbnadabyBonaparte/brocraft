import { describe, it, expect } from "vitest";

describe.skip("ChatBox (smoke)", () => {
  it("module exports correctly", async () => {
    const mod = await import("./ChatBox");
    expect(mod).toBeDefined();
    expect(typeof mod.ChatBox).toBe("function");
  });
});
