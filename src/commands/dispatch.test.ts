import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { handleDispatchCommand } from "./dispatch.js";

describe("handleDispatchCommand", () => {
  it("returns error if no trackId provided", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dispatch-cmd-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({ version: "1.0.0", structure: "multi-repo", barrels: [] })
      );
      const output = await handleDispatchCommand("", tmpDir);
      expect(output).toContain("Usage: /battery:dispatch <track_id>");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("dispatches track across existing barrels", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dispatch-cmd-test-"));
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

      const trackDir = path.join(tmpDir, ".cooper", "active", "auth-v2");
      await fs.mkdir(trackDir, { recursive: true });

      const output = await handleDispatchCommand("auth-v2", tmpDir);
      expect(output).toContain("dispatched successfully across 1 barrels");
      expect(output).toContain("auth");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("halts if some configured barrels are missing", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dispatch-cmd-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "missing-barrel", path: "./missing-path" }],
        })
      );

      const trackDir = path.join(tmpDir, ".cooper", "active", "auth-v2");
      await fs.mkdir(trackDir, { recursive: true });

      const output = await handleDispatchCommand("auth-v2", tmpDir);
      expect(output).toContain("Cannot dispatch track 'auth-v2': some barrels are missing");
      expect(output).toContain("missing-barrel");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
