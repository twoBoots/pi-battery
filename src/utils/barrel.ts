import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import type { ExtensionContext } from "../types.js";
import { readBatteryConfig } from "./battery-fs.js";

export interface ResolvedBarrelTarget {
  barrelName?: string;
  trackId?: string;
  resolvedPath: string;
  exists: boolean;
  isWorktree: boolean;
}

export interface WorkspaceSwitchResult {
  success: boolean;
  previousPath: string;
  currentPath: string;
  error?: string;
}

export interface TrustSyncOptions {
  trustFilePath?: string;
}

export interface TrustSyncResult {
  added: boolean;
  trustedPaths: string[];
  trustFilePath: string;
}

/**
 * Resolves a navigation target (barrel name, barrel/track, or track worktree)
 */
export async function resolveBarrelTarget(
  batteryRoot: string,
  targetInput: string
): Promise<ResolvedBarrelTarget> {
  const cleanInput = targetInput.trim();
  const config = await readBatteryConfig(batteryRoot);

  if (!cleanInput) {
    return {
      resolvedPath: batteryRoot,
      exists: true,
      isWorktree: false,
    };
  }

  // Check if targetInput has barrel/track syntax
  if (cleanInput.includes("/")) {
    const [barrelName, ...rest] = cleanInput.split("/");
    const trackId = rest.join("/");
    const barrel = config?.barrels.find((b) => b.name === barrelName);

    if (barrel) {
      const barrelAbs = path.resolve(batteryRoot, barrel.path);
      const worktreePath = path.resolve(barrelAbs, ".worktrees", trackId);
      let exists = false;
      try {
        const stat = await fs.stat(worktreePath);
        exists = stat.isDirectory();
      } catch {
        exists = false;
      }

      return {
        barrelName,
        trackId,
        resolvedPath: worktreePath,
        exists,
        isWorktree: true,
      };
    }
  }

  // Check if target is a barrel name
  const barrel = config?.barrels.find((b) => b.name === cleanInput);
  if (barrel) {
    const barrelAbs = path.resolve(batteryRoot, barrel.path);
    let exists = false;
    try {
      const stat = await fs.stat(barrelAbs);
      exists = stat.isDirectory();
    } catch {
      exists = false;
    }

    return {
      barrelName: barrel.name,
      resolvedPath: barrelAbs,
      exists,
      isWorktree: false,
    };
  }

  // Check if target is a worktree directly in battery root
  const rootWorktreePath = path.resolve(batteryRoot, ".worktrees", cleanInput);
  let rootWorktreeExists = false;
  try {
    const stat = await fs.stat(rootWorktreePath);
    rootWorktreeExists = stat.isDirectory();
  } catch {
    rootWorktreeExists = false;
  }

  if (rootWorktreeExists) {
    return {
      trackId: cleanInput,
      resolvedPath: rootWorktreePath,
      exists: true,
      isWorktree: true,
    };
  }

  return {
    resolvedPath: path.resolve(batteryRoot, cleanInput),
    exists: false,
    isWorktree: false,
  };
}

/**
 * Changes process working directory and updates ExtensionContext
 */
export async function switchWorkspace(
  targetPath: string,
  context?: ExtensionContext
): Promise<WorkspaceSwitchResult> {
  const previousPath = process.cwd();
  const resolvedTarget = path.resolve(targetPath);

  try {
    const stat = await fs.stat(resolvedTarget);
    if (!stat.isDirectory()) {
      return {
        success: false,
        previousPath,
        currentPath: previousPath,
        error: `Target path is not a directory: ${resolvedTarget}`,
      };
    }

    const realTarget = await fs.realpath(resolvedTarget);
    process.chdir(realTarget);

    if (context) {
      context.workspacePath = realTarget;
    }

    return {
      success: true,
      previousPath,
      currentPath: realTarget,
    };
  } catch (err) {
    return {
      success: false,
      previousPath,
      currentPath: previousPath,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Idempotently registers a path in Pi's trust registry (~/.pi/agent/trust.json)
 */
export async function syncTrustRegistry(
  targetPath: string,
  options?: TrustSyncOptions
): Promise<TrustSyncResult> {
  const defaultTrustPath = path.join(os.homedir(), ".pi", "agent", "trust.json");
  const trustFile = options?.trustFilePath ?? defaultTrustPath;
  const resolvedTarget = path.resolve(targetPath);

  let trustData: { trustedPaths?: string[]; [key: string]: unknown } = {
    trustedPaths: [],
  };

  try {
    const content = await fs.readFile(trustFile, "utf8");
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") {
      trustData = parsed;
    }
  } catch {
    // File doesn't exist or is invalid
  }

  const existingPaths = Array.isArray(trustData.trustedPaths)
    ? [...trustData.trustedPaths]
    : [];

  let added = false;
  if (!existingPaths.includes(resolvedTarget)) {
    existingPaths.push(resolvedTarget);
    trustData.trustedPaths = existingPaths;
    added = true;

    await fs.mkdir(path.dirname(trustFile), { recursive: true });
    await fs.writeFile(trustFile, JSON.stringify(trustData, null, 2), "utf8");
  }

  return {
    added,
    trustedPaths: existingPaths,
    trustFilePath: trustFile,
  };
}
