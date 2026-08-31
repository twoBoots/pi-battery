import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { loadBatteryWidgetState } from "./state.js";

describe("loadBatteryWidgetState", () => {
  it("returns non-battery state if no root found", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "widget-state-test-"));
    try {
      const state = await loadBatteryWidgetState(tmpDir);
      expect(state.isBatteryWorkspace).toBe(false);
      expect(state.barrelCount).toBe(0);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("loads full state when batteryrc and active tracks exist", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "widget-state-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "auth", path: "./auth" }, { name: "web", path: "./web" }],
        })
      );

      const trackDir = path.join(tmpDir, ".cooper", "active", "track-auth");
      await fs.mkdir(trackDir, { recursive: true });
      await fs.writeFile(
        path.join(trackDir, "metadata.json"),
        JSON.stringify({
          track_id: "track-auth",
          title: "Track Auth",
          type: "feature",
          status: "in_progress",
          created_at: "2026-08-31",
        })
      );
      await fs.writeFile(
        path.join(trackDir, "plan.md"),
        "## Phase 1: Core\n- [x] Task [auth]: Build\n- [ ] Task [web]: UI"
      );

      const state = await loadBatteryWidgetState(tmpDir);
      expect(state.isBatteryWorkspace).toBe(true);
      expect(state.structure).toBe("multi-repo");
      expect(state.barrelCount).toBe(2);
      expect(state.activeTrackId).toBe("track-auth");
      expect(state.currentPhase).toBe("Phase 1: Core");
      expect(state.progressText).toBe("1/2");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
