import { describe, it, expect } from "vitest";
import { isBatteryConfig, isBarrelConfig, isTrackMetadata } from "./types.js";

describe("Type Guards", () => {
  it("validates BatteryConfig objects correctly", () => {
    expect(isBatteryConfig(null)).toBe(false);
    expect(isBatteryConfig("")).toBe(false);
    expect(isBatteryConfig({})).toBe(false);
    expect(
      isBatteryConfig({
        version: "1.0.0",
        structure: "multi-repo",
        barrels: [],
      })
    ).toBe(true);
  });

  it("validates BarrelConfig objects correctly", () => {
    expect(isBarrelConfig(null)).toBe(false);
    expect(isBarrelConfig({ name: "core" })).toBe(false);
    expect(isBarrelConfig({ name: "core", path: "../core" })).toBe(true);
  });

  it("validates BatteryTrackMetadata objects correctly", () => {
    expect(isTrackMetadata(null)).toBe(false);
    expect(
      isTrackMetadata({
        track_id: "auth-v2",
        title: "Auth V2",
        type: "feature",
        status: "in_progress",
        created_at: "2026-08-31",
      })
    ).toBe(true);
  });
});
