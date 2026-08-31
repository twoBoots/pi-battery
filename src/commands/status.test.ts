import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { handleStatusCommand } from "./status.js";

describe("handleStatusCommand", () => {
  it("returns error if not in a Battery workspace", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "battery-status-test-"));
    try {
      const output = await handleStatusCommand(tmpDir);
      expect(output).toContain("Not in a Battery workspace");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns workspace status and idle state when no tracks active", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "battery-status-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "auth", path: "./auth" }],
        })
      );

      const output = await handleStatusCommand(tmpDir);
      expect(output).toContain("Topology: multi-repo");
      expect(output).toContain("Idle");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns active track status and barrel progress breakdown", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "battery-status-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "auth", path: "./auth" }],
        })
      );

      const trackDir = path.join(tmpDir, ".cooper", "active", "auth-v2");
      await fs.mkdir(trackDir, { recursive: true });
      await fs.writeFile(
        path.join(trackDir, "metadata.json"),
        JSON.stringify({
          track_id: "auth-v2",
          title: "Auth V2",
          type: "feature",
          status: "in_progress",
          created_at: "2026-08-31",
        })
      );
      await fs.writeFile(
        path.join(trackDir, "plan.md"),
        "## Phase 1\n- [x] Task [auth]: Core logic\n- [ ] Task [auth]: Tests"
      );

      const output = await handleStatusCommand(tmpDir);
      expect(output).toContain("Auth V2");
      expect(output).toContain("auth: 1/2");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
