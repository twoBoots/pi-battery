import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { handleValidateCommand } from "./validate.js";

describe("handleValidateCommand", () => {
  it("returns error if not in Battery workspace", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "validate-cmd-test-"));
    try {
      const output = await handleValidateCommand(tmpDir);
      expect(output).toContain("Not in a Battery workspace");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("validates valid workspace and living specs", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "validate-cmd-test-"));
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

      const specDir = path.join(tmpDir, ".cooper", "specs", "core");
      await fs.mkdir(specDir, { recursive: true });
      await fs.writeFile(
        path.join(specDir, "spec.md"),
        "### Requirement: Core\n#### Scenario: Boot\n- GIVEN system ready\n- WHEN boot\n- THEN ok"
      );

      const output = await handleValidateCommand(tmpDir);
      expect(output).toContain("All configuration, barrels, and capability specifications are valid");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("reports missing barrel and invalid scenario steps", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "validate-cmd-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "auth", path: "./missing-auth" }],
        })
      );

      const specDir = path.join(tmpDir, ".cooper", "specs", "core");
      await fs.mkdir(specDir, { recursive: true });
      await fs.writeFile(
        path.join(specDir, "spec.md"),
        "### Requirement: Core\n#### Scenario: Boot\n- INVALID step format"
      );

      const output = await handleValidateCommand(tmpDir);
      expect(output).toContain("Validation failed");
      expect(output).toContain("does not exist on disk");
      expect(output).toContain("Scenario step must start with GIVEN");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
