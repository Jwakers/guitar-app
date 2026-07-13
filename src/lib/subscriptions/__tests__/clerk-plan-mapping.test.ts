import { describe, expect, it } from "vitest";
import { tierFromClerkPlanSlug } from "../entitlements";

describe("tierFromClerkPlanSlug", () => {
  it("maps active pro plan to pro tier", () => {
    expect(tierFromClerkPlanSlug("pro", "active")).toBe("pro");
  });

  it("maps trialing pro plan to pro tier", () => {
    expect(tierFromClerkPlanSlug("pro", "trialing")).toBe("pro");
  });

  it("maps canceled pro plan to free tier", () => {
    expect(tierFromClerkPlanSlug("pro", "canceled")).toBe("free");
  });

  it("maps past due pro plan to free tier", () => {
    expect(tierFromClerkPlanSlug("pro", "past_due")).toBe("free");
  });

  it("maps missing plan to free tier", () => {
    expect(tierFromClerkPlanSlug(undefined, "active")).toBe("free");
    expect(tierFromClerkPlanSlug(null, "active")).toBe("free");
  });

  it("maps non-pro plans to free tier", () => {
    expect(tierFromClerkPlanSlug("free_user", "active")).toBe("free");
    expect(tierFromClerkPlanSlug("starter", "active")).toBe("free");
  });
});
