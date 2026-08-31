import * as path from "node:path";
import * as fs from "node:fs/promises";
import {
  isBatteryConfig,
  isTrackMetadata,
  type BatteryConfig,
  type BatteryTrackMetadata,
  type MultiBarrelPlanSummary,
  type ResolvedBarrel,
} from "../types.js";

/**
 * Searches upwards from startDir to locate the directory containing `.batteryrc` or `.cooper/index.md`
 */
export async function findBatteryRoot(startDir: string): Promise<string | null> {
  let current = path.resolve(startDir);
  while (true) {
    try {
      const batteryrc = path.join(current, ".batteryrc");
      const stat = await fs.stat(batteryrc);
      if (stat.isFile()) {
        return current;
      }
    } catch {
      // not found in current dir
    }

    try {
      const cooperIndex = path.join(current, ".cooper", "index.md");
      const stat = await fs.stat(cooperIndex);
      if (stat.isFile()) {
        return current;
      }
    } catch {
      // continue upwards
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return null;
}

/**
 * Reads and merges .batteryrc and .batteryrc.local
 */
export async function readBatteryConfig(batteryRoot: string): Promise<BatteryConfig | null> {
  const rcPath = path.join(batteryRoot, ".batteryrc");
  let baseConfig: BatteryConfig | null = null;

  try {
    const content = await fs.readFile(rcPath, "utf8");
    const parsed: unknown = JSON.parse(content);
    if (isBatteryConfig(parsed)) {
      baseConfig = parsed;
    }
  } catch {
    // .batteryrc might not exist or is invalid JSON
  }

  if (!baseConfig) {
    return null;
  }

  // Check for local overrides (.batteryrc.local)
  const localRcPath = path.join(batteryRoot, ".batteryrc.local");
  try {
    const localContent = await fs.readFile(localRcPath, "utf8");
    const localParsed: unknown = JSON.parse(localContent);
    if (isBatteryConfig(localParsed)) {
      const mergedBarrelsMap = new Map(baseConfig.barrels.map((b) => [b.name, b]));
      for (const localBarrel of localParsed.barrels) {
        mergedBarrelsMap.set(localBarrel.name, localBarrel);
      }
      baseConfig = {
        ...baseConfig,
        structure: localParsed.structure ?? baseConfig.structure,
        barrels: Array.from(mergedBarrelsMap.values()),
      };
    }
  } catch {
    // local file optional
  }

  return baseConfig;
}

/**
 * Resolves each barrel's filesystem path, existence, and Cooper tech-stack definition
 */
export async function resolveBarrels(
  batteryRoot: string,
  config: BatteryConfig
): Promise<ResolvedBarrel[]> {
  const results: ResolvedBarrel[] = [];

  for (const barrel of config.barrels) {
    const absPath = path.resolve(batteryRoot, barrel.path);
    let exists = false;
    let techStack = "Unknown";

    try {
      const stat = await fs.stat(absPath);
      exists = stat.isDirectory();
    } catch {
      exists = false;
    }

    if (exists) {
      const stackPath = path.join(absPath, ".cooper", "definition", "tech-stack.md");
      try {
        const stackContent = await fs.readFile(stackPath, "utf8");
        const lines = stackContent.split("\n");
        for (const line of lines) {
          if (line.startsWith("#")) {
            continue;
          }
          if (line.toLowerCase().includes("language:") || line.toLowerCase().includes("language")) {
            const match = line.replace(/^[-*#\s]*language[:\s]*/i, "").replace(/^\*+|\*+$/g, "").trim();
            if (match) {
              techStack = match;
              break;
            }
          }
        }
        if (techStack === "Unknown") {
          techStack = "Cooper SDD";
        }
      } catch {
        techStack = "Unspecified";
      }
    }

    results.push({
      name: barrel.name,
      path: barrel.path,
      absolutePath: absPath,
      type: barrel.type ?? "barrel",
      exists,
      techStack,
    });
  }

  return results;
}

/**
 * Reads all active multi-barrel track metadata from .cooper/active/
 */
export async function readBatteryTracks(batteryRoot: string): Promise<BatteryTrackMetadata[]> {
  const activeDir = path.join(batteryRoot, ".cooper", "active");
  const tracks: BatteryTrackMetadata[] = [];

  try {
    const entries = await fs.readdir(activeDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metaPath = path.join(activeDir, entry.name, "metadata.json");
        try {
          const metaContent = await fs.readFile(metaPath, "utf8");
          const parsed: unknown = JSON.parse(metaContent);
          if (isTrackMetadata(parsed)) {
            tracks.push(parsed);
          }
        } catch {
          // ignore invalid track metadata
        }
      }
    }
  } catch {
    // active directory might not exist
  }

  return tracks;
}

/**
 * Parses a multi-barrel plan.md for phase progress, total tasks, and per-barrel breakdown
 */
export async function readMultiBarrelPlan(planFilePath: string): Promise<MultiBarrelPlanSummary> {
  const defaultSummary: MultiBarrelPlanSummary = {
    totalPhases: 0,
    currentPhase: "None",
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    barrelBreakdown: {},
  };

  try {
    const content = await fs.readFile(planFilePath, "utf8");
    const lines = content.split("\n");

    let phasesCount = 0;
    let currentPhase = "";
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let pendingTasks = 0;
    const barrelBreakdown: Record<string, { total: number; completed: number }> = {};

    for (const line of lines) {
      if (line.startsWith("## Phase")) {
        phasesCount++;
        if (!currentPhase) {
          currentPhase = line.replace(/^##\s*/, "").trim();
        }
        continue;
      }

      const taskMatch = line.match(/^-\s*\[([ xX~])\]\s*Task(?:\s*\[([^\]]+)\])?:\s*(.+)/);
      if (taskMatch) {
        totalTasks++;
        const state = taskMatch[1];
        const barrelTag = taskMatch[2]?.trim();
        const isDone = state === "x" || state === "X";
        const isInProgress = state === "~";

        if (isDone) {
          completedTasks++;
        } else if (isInProgress) {
          inProgressTasks++;
        } else {
          pendingTasks++;
        }

        if (barrelTag) {
          if (!barrelBreakdown[barrelTag]) {
            barrelBreakdown[barrelTag] = { total: 0, completed: 0 };
          }
          barrelBreakdown[barrelTag].total++;
          if (isDone) {
            barrelBreakdown[barrelTag].completed++;
          }
        }
      }
    }

    return {
      totalPhases: phasesCount,
      currentPhase: currentPhase || "Phase 1",
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      barrelBreakdown,
    };
  } catch {
    return defaultSummary;
  }
}
