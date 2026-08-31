import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import {
  resolveBarrelTarget,
  switchWorkspace,
  syncTrustRegistry,
} from "./barrel.js";
import type { ExtensionContext } from "../types.js";

describe("barrel navigation and trust utilities", () => {
  it("resolves barrel target paths correctly", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "barrel-test-"));
    try {
      const authDir = path.join(tmpDir, "auth-service");
      const authWorktree = path.join(authDir, ".worktrees", "track-auth");
      await fs.mkdir(authWorktree, { recursive: true });

      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "auth-service", path: "./auth-service" }],
        })
      );

      const target1 = await resolveBarrelTarget(tmpDir, "auth-service");
      expect(target1.exists).toBe(true);
      expect(target1.barrelName).toBe("auth-service");
      expect(target1.isWorktree).toBe(false);

      const target2 = await resolveBarrelTarget(tmpDir, "auth-service/track-auth");
      expect(target2.exists).toBe(true);
      expect(target2.isWorktree).toBe(true);
      expect(target2.trackId).toBe("track-auth");

      const emptyTarget = await resolveBarrelTarget(tmpDir, "");
      expect(emptyTarget.resolvedPath).toBe(tmpDir);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("switches workspace directory and updates context", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "switch-test-"));
    const origCwd = process.cwd();
    try {
      const mockContext: ExtensionContext = {
        registerCommand: () => {},
        workspacePath: origCwd,
      };

      const result = await switchWorkspace(tmpDir, mockContext);
      expect(result.success).toBe(true);
      expect(mockContext.workspacePath).toBe(await fs.realpath(tmpDir));

      const invalidResult = await switchWorkspace(path.join(tmpDir, "nonexistent"));
      expect(invalidResult.success).toBe(false);
    } finally {
      process.chdir(origCwd);
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("syncs paths with Pi trust registry idempotently", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trust-test-"));
    try {
      const trustFile = path.join(tmpDir, "trust.json");
      const target = path.join(tmpDir, "my-repo");
      await fs.mkdir(target);

      const res1 = await syncTrustRegistry(target, { trustFilePath: trustFile });
      expect(res1.added).toBe(true);
      expect(res1.trustedPaths).toContain(path.resolve(target));

      const res2 = await syncTrustRegistry(target, { trustFilePath: trustFile });
      expect(res2.added).toBe(false);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
