import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { handlePreCommitHook, handlePreToolHook } from "./hooks.js";

describe("Lifecycle Hooks", () => {
  it("pre-tool hook allows non-mutating tools", async () => {
    const result = await handlePreToolHook({
      toolName: "read_file",
    });
    expect(result.allowed).toBe(true);
  });

  it("pre-tool hook enforces spec deltas on file mutation tools", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "hook-test-"));
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

      const result = await handlePreToolHook({
        toolName: "write_to_file",
        workspacePath: tmpDir,
        trackId: "auth-v2",
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("valid living spec deltas");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("pre-commit hook checks spec health and supports bypass", async () => {
    const bypassResult = await handlePreCommitHook({ bypass: true });
    expect(bypassResult.success).toBe(true);
    expect(bypassResult.message).toContain("Bypass active");
  });
});
