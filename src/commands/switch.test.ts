import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { handleSwitchCommand } from "./switch.js";
import type { ExtensionContext } from "../types.js";

describe("handleSwitchCommand", () => {
  it("returns usage help if no target provided", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "switch-cmd-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "auth", path: "./auth" }],
        })
      );

      const output = await handleSwitchCommand("", tmpDir);
      expect(output).toContain("Usage: /battery:switch");
      expect(output).toContain("auth");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("switches to target barrel root", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "switch-cmd-test-"));
    const origCwd = process.cwd();
    try {
      const authDir = path.join(tmpDir, "auth-service");
      await fs.mkdir(authDir);

      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "auth", path: "./auth-service" }],
        })
      );

      const mockContext: ExtensionContext = {
        registerCommand: () => {},
        workspacePath: tmpDir,
      };

      const output = await handleSwitchCommand("auth", mockContext);
      expect(output).toContain("Switched workspace to barrel: auth");
      expect(mockContext.workspacePath).toBe(await fs.realpath(authDir));
    } finally {
      process.chdir(origCwd);
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns error for nonexistent barrel", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "switch-cmd-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [],
        })
      );

      const output = await handleSwitchCommand("nonexistent", tmpDir);
      expect(output).toContain("Target destination not found");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
