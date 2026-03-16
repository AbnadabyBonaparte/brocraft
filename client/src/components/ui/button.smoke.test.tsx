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
});
