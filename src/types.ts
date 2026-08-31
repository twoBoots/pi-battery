/**
 * Barrel definition in .batteryrc
 */
export interface BarrelConfig {
  name: string;
  path: string;
  type?: "barrel" | "battery";
}

/**
 * Root Battery configuration schema (.batteryrc / .batteryrc.local)
 */
export interface BatteryConfig {
  $schema?: string;
  version: string;
  structure: "multi-repo" | "monorepo" | "custom";
  barrels: BarrelConfig[];
}

/**
 * Resolved barrel with disk status and tech-stack details
 */
export interface ResolvedBarrel {
  name: string;
  path: string;
  absolutePath: string;
  type: "barrel" | "battery";
  exists: boolean;
  techStack?: string;
}

/**
 * Multi-barrel Track metadata structure (.cooper/active/<track_id>/metadata.json)
 */
export interface BatteryTrackMetadata {
  track_id: string;
  title: string;
  type: "feature" | "bugfix" | "chore" | "rfc";
  status: "new" | "in_progress" | "review" | "completed" | "archived";
  barrels?: string[];
  created_at: string;
  completed_at?: string;
}

/**
 * Multi-barrel plan summary parsed from plan.md
 */
export interface MultiBarrelPlanSummary {
  totalPhases: number;
  currentPhase: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  barrelBreakdown: Record<string, { total: number; completed: number }>;
}

/**
 * Type guard for BatteryConfig
 */
export function isBatteryConfig(obj: unknown): obj is BatteryConfig {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.version === "string" &&
    typeof candidate.structure === "string" &&
    Array.isArray(candidate.barrels)
  );
}

/**
 * Type guard for BarrelConfig
 */
export function isBarrelConfig(obj: unknown): obj is BarrelConfig {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return typeof candidate.name === "string" && typeof candidate.path === "string";
}

/**
 * Type guard for BatteryTrackMetadata
 */
export function isTrackMetadata(obj: unknown): obj is BatteryTrackMetadata {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.track_id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.created_at === "string"
  );
}

/**
 * Minimal Pi ExtensionContext interface definition
 */
export interface ExtensionContext {
  registerCommand(name: string, handler: (...args: unknown[]) => Promise<unknown> | unknown): void;
  registerStatusBarItem?(item: { id: string; text: string; tooltip?: string }): void;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  workspacePath?: string;
}
