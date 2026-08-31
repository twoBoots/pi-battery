import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { handleBarrelsCommand } from "./barrels.js";

describe("handleBarrelsCommand", () => {
  it("returns error if not in Battery workspace", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "barrels-test-"));
    try {
      const output = await handleBarrelsCommand(tmpDir);
      expect(output).toContain("Not in a Battery workspace");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("lists configured barrels", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "barrels-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "auth", path: "./auth" }],
        })
      );

      const output = await handleBarrelsCommand(tmpDir);
      expect(output).toContain("Registered Barrels (1)");
      expect(output).toContain("auth");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
