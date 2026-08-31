import * as path from "node:path";
import * as fs from "node:fs/promises";
import {
  findBatteryRoot,
  readBatteryConfig,
  resolveBarrels,
} from "../utils/battery-fs.js";
import {
  formatValidationReport,
  type ValidationIssue,
} from "../utils/format.js";

/**
 * Executes /battery:validate in-process in <5ms
 */
export async function handleValidateCommand(workspacePath?: string): Promise<string> {
  const currentDir = workspacePath ?? process.cwd();
  const batteryRoot = await findBatteryRoot(currentDir);

  if (!batteryRoot) {
    return "⚠️ [Battery SDD] Not in a Battery workspace (no .batteryrc or .cooper/ directory found).";
  }

  const issues: ValidationIssue[] = [];

  // Validate .batteryrc
  const config = await readBatteryConfig(batteryRoot);
  if (!config) {
    issues.push({
      file: ".batteryrc",
      message: "Missing or invalid .batteryrc configuration",
    });
  } else {
    // Validate barrel directories
    const barrels = await resolveBarrels(batteryRoot, config);
    for (const barrel of barrels) {
      if (!barrel.exists) {
        issues.push({
          file: ".batteryrc",
          message: `Configured barrel '${barrel.name}' does not exist on disk at '${barrel.path}'`,
        });
      }
    }
  }

  // Validate living specs
  const specsDir = path.join(batteryRoot, ".cooper", "specs");
  await validateSpecDirectory(specsDir, batteryRoot, issues);

  // Validate active track spec deltas
  const activeDir = path.join(batteryRoot, ".cooper", "active");
  try {
    const activeEntries = await fs.readdir(activeDir, { withFileTypes: true });
    for (const entry of activeEntries) {
      if (entry.isDirectory()) {
        const deltasDir = path.join(activeDir, entry.name, "spec-deltas");
        await validateSpecDirectory(deltasDir, batteryRoot, issues);
      }
    }
  } catch {
    // active dir may not exist
  }

  const isValid = issues.length === 0;
  return formatValidationReport(isValid, issues);
}

async function validateSpecDirectory(
  baseDir: string,
  rootPath: string,
  issues: ValidationIssue[]
): Promise<void> {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const fullPath = path.join(entry.parentPath ?? baseDir, entry.name);
        const relPath = path.relative(rootPath, fullPath);
        await auditSpecFile(fullPath, relPath, issues);
      }
    }
  } catch {
    // directory may not exist
  }
}

async function auditSpecFile(
  filePath: string,
  relPath: string,
  issues: ValidationIssue[]
): Promise<void> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n");

    let inScenario = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNum = i + 1;

      if (line.includes("Scenario:")) {
        inScenario = true;
        continue;
      }

      if (line.startsWith("### ") || line.startsWith("## ") || line.startsWith("---")) {
        inScenario = false;
      }

      if (inScenario && line.trim().startsWith("- ")) {
        const step = line.replace(/^\s*-\s*/, "");
        const validKeyword = /^(GIVEN|WHEN|THEN|AND)\b/i.test(step);
        if (!validKeyword) {
          issues.push({
            file: relPath,
            line: lineNum,
            message: "Scenario step must start with GIVEN, WHEN, THEN, or AND",
          });
        }
      }
    }
  } catch (err) {
    issues.push({
      file: relPath,
      message: `Failed to read spec file: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}
