import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (utils)", () => {
  it("retorna string vazia para nenhum argumento", () => {
    expect(cn()).toBe("");
  });

  it("mescla classes e resolve conflitos tailwind", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("aceita condicionais", () => {
    const includeB = false;
    expect(cn("a", includeB && "b", "c")).toBe("a c");
  });

  it("aceita array e objeto", () => {
    expect(cn(["a", "b"])).toBe("a b");
    expect(cn({ a: true, b: false })).toBe("a");
  });

  it("ignora undefined e null", () => {
    expect(cn("a", undefined, "b", null)).toBe("a b");
  });

  it("retorna uma única classe quando só uma é passada", () => {
    expect(cn("single")).toBe("single");
  });
});
