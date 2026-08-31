import * as path from "node:path";
import {
  findBatteryRoot,
  readBatteryConfig,
  readBatteryTracks,
  readMultiBarrelPlan,
  resolveBarrels,
} from "../utils/battery-fs.js";
import {
  formatBarrelsList,
  formatStatusBadge,
  renderProgressBar,
} from "../utils/format.js";

/**
 * Executes /battery:status in-process in <5ms
 */
export async function handleStatusCommand(workspacePath?: string): Promise<string> {
  const currentDir = workspacePath ?? process.cwd();
  const batteryRoot = await findBatteryRoot(currentDir);

  if (!batteryRoot) {
    return "⚠️ [Battery SDD] Not in a Battery workspace (no .batteryrc or .cooper/ directory found).\nRun 'battery init' to configure a Battery workspace.";
  }

  const config = await readBatteryConfig(batteryRoot);
  if (!config) {
    return "⚠️ [Battery SDD] No .batteryrc configuration found. Run 'battery init' to configure barrels.";
  }

  const resolvedBarrels = await resolveBarrels(batteryRoot, config);
  const activeTracks = await readBatteryTracks(batteryRoot);

  const outputLines: string[] = [
    `🛢️⚡ [Battery SDD] Topology: ${config.structure} (${resolvedBarrels.length} registered barrels)`,
    "",
    "Barrels:",
    formatBarrelsList(resolvedBarrels),
    "",
  ];

  if (activeTracks.length === 0) {
    outputLines.push("Active Tracks: Idle (No active multi-barrel track)");
  } else {
    outputLines.push("Active Tracks:");
    for (const track of activeTracks) {
      const trackDir = path.join(batteryRoot, ".cooper", "active", track.track_id);
      const planPath = path.join(trackDir, "plan.md");
      const plan = await readMultiBarrelPlan(planPath);
      const progressBar = renderProgressBar(plan.completedTasks, plan.totalTasks);
      const badge = formatStatusBadge(track.status);

      outputLines.push(`• Track: ${track.title} (${track.track_id}) ${badge}`);
      outputLines.push(`  Phase: ${plan.currentPhase}`);
      outputLines.push(`  Progress: ${progressBar}`);

      const breakdownKeys = Object.keys(plan.barrelBreakdown);
      if (breakdownKeys.length > 0) {
        const breakdownStr = breakdownKeys
          .map((b) => `${b}: ${plan.barrelBreakdown[b]?.completed}/${plan.barrelBreakdown[b]?.total}`)
          .join(", ");
        outputLines.push(`  Barrels Breakdown: ${breakdownStr}`);
      }
      outputLines.push("");
    }
  }

  return outputLines.join("\n").trimEnd();
}
