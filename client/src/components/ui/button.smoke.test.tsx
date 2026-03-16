import { describe, it, expect } from "vitest";
import { Button, buttonVariants } from "./button";

describe("Button (smoke)", () => {
  it("Button está definido e é um componente", () => {
    expect(Button).toBeDefined();
    expect(typeof Button).toBe("function");
  });

  it("buttonVariants está definido e gera classes para default", () => {
    expect(buttonVariants).toBeDefined();
    const classes = buttonVariants({ variant: "default", size: "default" });
    expect(classes).toContain("bg-primary");
    expect(classes).toContain("text-primary-foreground");
  });

  it("buttonVariants destructive usa text-destructive-foreground", () => {
    const classes = buttonVariants({ variant: "destructive", size: "default" });
    expect(classes).toContain("text-destructive-foreground");
  });

  it("buttonVariants outline retorna classes de borda", () => {
    const classes = buttonVariants({ variant: "outline", size: "default" });
    expect(classes).toContain("border");
  });

  it("buttonVariants size sm e lg existem", () => {
    const sm = buttonVariants({ variant: "default", size: "sm" });
    const lg = buttonVariants({ variant: "default", size: "lg" });
    expect(sm.length).toBeGreaterThan(0);
    expect(lg.length).toBeGreaterThan(0);
  });
});
