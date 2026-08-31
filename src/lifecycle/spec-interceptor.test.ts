import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { CrossBarrelSpecInterceptor } from "./spec-interceptor.js";

describe("CrossBarrelSpecInterceptor", () => {
  it("allows bypass", async () => {
    const interceptor = new CrossBarrelSpecInterceptor();
    const result = await interceptor.validateTrackChanges({ bypass: true });
    expect(result.allowed).toBe(true);
    expect(result.bypassUsed).toBe(true);
  });

  it("passes when spec deltas are valid", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "interceptor-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({ version: "1.0.0", structure: "multi-repo", barrels: [] })
      );

      const trackDir = path.join(tmpDir, ".cooper", "active", "auth-v2");
      const deltasDir = path.join(trackDir, "spec-deltas");
      await fs.mkdir(deltasDir, { recursive: true });

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
        path.join(deltasDir, "spec.md"),
        "### Requirement: Core Auth\n#### Scenario: Login\n- GIVEN valid user\n- WHEN login\n- THEN ok"
      );

      const interceptor = new CrossBarrelSpecInterceptor({ workspacePath: tmpDir });
      const result = await interceptor.validateTrackChanges({ trackId: "auth-v2" });
      expect(result.allowed).toBe(true);
      expect(result.issues).toHaveLength(0);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("blocks when spec delta missing or invalid", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "interceptor-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({ version: "1.0.0", structure: "multi-repo", barrels: [] })
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

      const interceptor = new CrossBarrelSpecInterceptor({ workspacePath: tmpDir });
      const result = await interceptor.validateTrackChanges({ trackId: "auth-v2" });
      expect(result.allowed).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
