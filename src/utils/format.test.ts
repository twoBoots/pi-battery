import { describe, it, expect } from "vitest";
import {
  formatBarrelsList,
  formatStatusBadge,
  formatTracksList,
  formatValidationReport,
  renderProgressBar,
} from "./format.js";

describe("format utilities", () => {
  it("formats status badges correctly", () => {
    expect(formatStatusBadge("completed")).toBe("[✓ Completed]");
    expect(formatStatusBadge("in_progress")).toBe("[▶ In Progress]");
    expect(formatStatusBadge("review")).toBe("[🔍 Review]");
    expect(formatStatusBadge("new")).toBe("[★ New]");
    expect(formatStatusBadge("archived")).toBe("[📦 Archived]");
    expect(formatStatusBadge("other")).toBe("[other]");
  });

  it("renders progress bars correctly", () => {
    expect(renderProgressBar(0, 0)).toContain("0/0 (0%)");
    expect(renderProgressBar(5, 10, 10)).toContain("5/10 (50%)");
    expect(renderProgressBar(10, 10, 10)).toContain("10/10 (100%)");
  });

  it("formats barrels list", () => {
    expect(formatBarrelsList([])).toContain("No barrels");
    const formatted = formatBarrelsList([
      {
        name: "auth",
        path: "../auth",
        absolutePath: "/tmp/auth",
        type: "barrel",
        exists: true,
        techStack: "Go 1.22",
      },
    ]);
    expect(formatted).toContain("auth");
    expect(formatted).toContain("Go 1.22");
  });

  it("formats tracks list", () => {
    expect(formatTracksList([])).toContain("No active tracks");
    const formatted = formatTracksList([
      {
        track_id: "track-1",
        title: "Track One",
        type: "feature",
        status: "in_progress",
        barrels: ["auth", "web"],
        created_at: "2026-08-31",
      },
    ]);
    expect(formatted).toContain("Track One");
    expect(formatted).toContain("Barrels: auth, web");
  });

  it("formats validation report", () => {
    expect(formatValidationReport(true, [])).toContain("valid");
    const failed = formatValidationReport(false, [
      { file: ".batteryrc", message: "Missing barrel" },
    ]);
    expect(failed).toContain("Validation failed");
    expect(failed).toContain("Missing barrel");
  });
});
