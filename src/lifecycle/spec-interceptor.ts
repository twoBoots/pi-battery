import * as path from "node:path";
import * as fs from "node:fs/promises";
import { findBatteryRoot, readBatteryTracks } from "../utils/battery-fs.js";
import type { ValidationIssue } from "../utils/format.js";

export interface SpecInterceptorOptions {
  workspacePath?: string;
}

export interface ValidateTrackOptions {
  trackId?: string;
  modifiedFiles?: string[];
  bypass?: boolean;
}

export interface SpecValidationResult {
  allowed: boolean;
  bypassUsed: boolean;
  issues: ValidationIssue[];
}

/**
 * Validates living spec deltas and cross-barrel contract specifications
 */
export class CrossBarrelSpecInterceptor {
  private readonly workspacePath: string;

  constructor(options: SpecInterceptorOptions = {}) {
    this.workspacePath = options.workspacePath ?? process.cwd();
  }

  public async validateTrackChanges(
    options: ValidateTrackOptions = {}
  ): Promise<SpecValidationResult> {
    if (options.bypass) {
      return { allowed: true, bypassUsed: true, issues: [] };
    }

    const root = await findBatteryRoot(this.workspacePath);
    if (!root) {
      return { allowed: true, bypassUsed: false, issues: [] };
    }

    const tracks = await readBatteryTracks(root);
    const targetTrack = options.trackId
      ? tracks.find((t) => t.track_id === options.trackId)
      : tracks[0];

    if (!targetTrack) {
      return { allowed: true, bypassUsed: false, issues: [] };
    }

    const issues: ValidationIssue[] = [];
    const deltasDir = path.join(root, ".cooper", "active", targetTrack.track_id, "spec-deltas");

    try {
      const entries = await fs.readdir(deltasDir, { withFileTypes: true, recursive: true });
      let specCount = 0;
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(".md")) {
          specCount++;
          const fullPath = path.join(entry.parentPath ?? deltasDir, entry.name);
          const relPath = path.relative(root, fullPath);
          const content = await fs.readFile(fullPath, "utf8");

          const hasRequirements = content.includes("### Requirement") || content.includes("## Requirement");
          const hasScenarios = content.includes("Scenario:");

          if (!hasRequirements || !hasScenarios) {
            issues.push({
              file: relPath,
              message: "Spec delta must include structured Requirements and GIVEN/WHEN/THEN Scenarios.",
            });
          }
        }
      }

      if (specCount === 0) {
        issues.push({
          file: path.relative(root, deltasDir),
          message: `Active track '${targetTrack.track_id}' has no spec deltas in spec-deltas/`,
        });
      }
    } catch {
      issues.push({
        file: `.cooper/active/${targetTrack.track_id}/spec-deltas/`,
        message: `Active track '${targetTrack.track_id}' is missing spec-deltas directory.`,
      });
    }

    return {
      allowed: issues.length === 0,
      bypassUsed: false,
      issues,
    };
  }
}
