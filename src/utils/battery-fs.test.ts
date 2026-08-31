import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import {
  findBatteryRoot,
  readBatteryConfig,
  readBatteryTracks,
  readMultiBarrelPlan,
  resolveBarrels,
} from "./battery-fs.js";

describe("battery-fs utilities", () => {
  it("finds battery root by detecting .batteryrc", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "battery-fs-test-"));
    try {
      await fs.writeFile(path.join(tmpDir, ".batteryrc"), JSON.stringify({ version: "1.0.0", structure: "multi-repo", barrels: [] }));
      const nested = path.join(tmpDir, "a", "b", "c");
      await fs.mkdir(nested, { recursive: true });

      const found = await findBatteryRoot(nested);
      expect(found).toBe(tmpDir);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("finds battery root by detecting .cooper/index.md", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cooper-fs-test-"));
    try {
      await fs.mkdir(path.join(tmpDir, ".cooper"), { recursive: true });
      await fs.writeFile(path.join(tmpDir, ".cooper", "index.md"), "# Index");

      const found = await findBatteryRoot(tmpDir);
      expect(found).toBe(tmpDir);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("reads and merges .batteryrc and .batteryrc.local", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "battery-config-test-"));
    try {
      const baseConfig = {
        version: "1.0.0",
        structure: "multi-repo",
        barrels: [{ name: "auth", path: "../auth" }],
      };
      await fs.writeFile(path.join(tmpDir, ".batteryrc"), JSON.stringify(baseConfig));

      const localConfig = {
        version: "1.0.0",
        structure: "multi-repo",
        barrels: [{ name: "auth", path: "/custom/local/auth" }, { name: "web", path: "../web" }],
      };
      await fs.writeFile(path.join(tmpDir, ".batteryrc.local"), JSON.stringify(localConfig));

      const config = await readBatteryConfig(tmpDir);
      expect(config).toBeDefined();
      expect(config?.barrels).toHaveLength(2);
      expect(config?.barrels.find((b) => b.name === "auth")?.path).toBe("/custom/local/auth");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("resolves barrels with tech stacks", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "barrel-resolve-test-"));
    try {
      const barrelDir = path.join(tmpDir, "auth-service");
      await fs.mkdir(path.join(barrelDir, ".cooper", "definition"), { recursive: true });
      await fs.writeFile(
        path.join(barrelDir, ".cooper", "definition", "tech-stack.md"),
        "# Tech Stack\n- Language: Go 1.22"
      );

      const resolved = await resolveBarrels(tmpDir, {
        version: "1.0.0",
        structure: "multi-repo",
        barrels: [
          { name: "auth", path: "./auth-service" },
          { name: "missing", path: "./missing-dir" },
        ],
      });

      expect(resolved).toHaveLength(2);
      expect(resolved[0]?.exists).toBe(true);
      expect(resolved[0]?.techStack).toBe("Go 1.22");
      expect(resolved[1]?.exists).toBe(false);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("reads active tracks and multi-barrel plans", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "tracks-plan-test-"));
    try {
      const trackDir = path.join(tmpDir, ".cooper", "active", "track-auth");
      await fs.mkdir(trackDir, { recursive: true });
      await fs.writeFile(
        path.join(trackDir, "metadata.json"),
        JSON.stringify({
          track_id: "track-auth",
          title: "Auth Track",
          type: "feature",
          status: "in_progress",
          created_at: "2026-08-31",
        })
      );

      const planContent = `
## Phase 1: Foundation
- [x] Task [auth-service]: Implement JWT
- [~] Task [web-dashboard]: Add Login UI
- [ ] Task [auth-service]: Refresh Tokens
`;
      await fs.writeFile(path.join(trackDir, "plan.md"), planContent);

      const tracks = await readBatteryTracks(tmpDir);
      expect(tracks).toHaveLength(1);
      expect(tracks[0]?.track_id).toBe("track-auth");

      const plan = await readMultiBarrelPlan(path.join(trackDir, "plan.md"));
      expect(plan.totalPhases).toBe(1);
      expect(plan.totalTasks).toBe(3);
      expect(plan.completedTasks).toBe(1);
      expect(plan.inProgressTasks).toBe(1);
      expect(plan.pendingTasks).toBe(1);
      expect(plan.barrelBreakdown["auth-service"]?.total).toBe(2);
      expect(plan.barrelBreakdown["auth-service"]?.completed).toBe(1);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
