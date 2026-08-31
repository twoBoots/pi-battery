import { describe, it, expect } from "vitest";
import { formatWidgetStatusBar } from "./formatter.js";

describe("formatWidgetStatusBar", () => {
  it("returns empty string if not battery workspace", () => {
    expect(
      formatWidgetStatusBar({
        isBatteryWorkspace: false,
        barrelCount: 0,
        specStatus: "none",
      })
    ).toBe("");
  });

  it("formats idle battery status", () => {
    const formatted = formatWidgetStatusBar({
      isBatteryWorkspace: true,
      structure: "multi-repo",
      barrelCount: 3,
      specStatus: "none",
    });
    expect(formatted).toContain("[Battery: 3 barrels (multi-repo)]");
    expect(formatted).toContain("[Idle]");
  });

  it("formats active track status with phase and progress", () => {
    const formatted = formatWidgetStatusBar({
      isBatteryWorkspace: true,
      structure: "multi-repo",
      barrelCount: 2,
      activeTrackId: "auth-v2",
      currentPhase: "Phase 1: Core",
      progressText: "3/5",
      specStatus: "valid",
    });
    expect(formatted).toContain("[Battery: 2 barrels (multi-repo)]");
    expect(formatted).toContain("[Track: auth-v2]");
    expect(formatted).toContain("[Phase 1: Core]");
    expect(formatted).toContain("[Tasks: 3/5]");
  });
});
