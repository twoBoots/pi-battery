import * as path from "node:path";
import {
  findBatteryRoot,
  readBatteryConfig,
  readBatteryTracks,
  readMultiBarrelPlan,
  resolveBarrels,
} from "../utils/battery-fs.js";

export interface BatteryWidgetState {
  isBatteryWorkspace: boolean;
  structure?: "multi-repo" | "monorepo" | "custom";
  barrelCount: number;
  activeTrackId?: string;
  activeTrackTitle?: string;
  currentPhase?: string;
  progressText?: string;
  specStatus: "valid" | "invalid" | "none";
}

/**
 * Loads current widget state from disk
 */
export async function loadBatteryWidgetState(
  workspacePath: string
): Promise<BatteryWidgetState> {
  const root = await findBatteryRoot(workspacePath);
  if (!root) {
    return {
      isBatteryWorkspace: false,
      barrelCount: 0,
      specStatus: "none",
    };
  }

  const config = await readBatteryConfig(root);
  if (!config) {
    return {
      isBatteryWorkspace: true,
      barrelCount: 0,
      specStatus: "none",
    };
  }

  const barrels = await resolveBarrels(root, config);
  const tracks = await readBatteryTracks(root);
  const activeTrack = tracks[0];

  let currentPhase: string | undefined;
  let progressText: string | undefined;

  if (activeTrack) {
    const planPath = path.join(root, ".cooper", "active", activeTrack.track_id, "plan.md");
    const plan = await readMultiBarrelPlan(planPath);
    currentPhase = plan.currentPhase;
    progressText = `${plan.completedTasks}/${plan.totalTasks}`;
  }

  return {
    isBatteryWorkspace: true,
    structure: config.structure,
    barrelCount: barrels.length,
    activeTrackId: activeTrack?.track_id,
    activeTrackTitle: activeTrack?.title,
    currentPhase,
    progressText,
    specStatus: activeTrack ? "valid" : "none",
  };
}
