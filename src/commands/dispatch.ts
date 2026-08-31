import * as path from "node:path";
import * as fs from "node:fs/promises";
import {
  findBatteryRoot,
  readBatteryConfig,
  readBatteryTracks,
  resolveBarrels,
} from "../utils/battery-fs.js";

/**
 * Executes /battery:dispatch <track_id> to verify barrel readiness
 */
export async function handleDispatchCommand(
  trackId?: string,
  workspacePath?: string
): Promise<string> {
  const currentDir = workspacePath ?? process.cwd();
  const batteryRoot = await findBatteryRoot(currentDir);

  if (!batteryRoot) {
    return "⚠️ [Battery SDD] Not in a Battery workspace (no .batteryrc or .cooper/ directory found).";
  }

  if (!trackId || trackId.trim() === "") {
    const tracks = await readBatteryTracks(batteryRoot);
    const available = tracks.map((t) => `  - ${t.track_id} (${t.title})`).join("\n");
    return `⚠️ [Battery SDD] Usage: /battery:dispatch <track_id>\n\nAvailable tracks:\n${available || "  (None)"}`;
  }

  const trackDir = path.join(batteryRoot, ".cooper", "active", trackId);
  try {
    await fs.stat(trackDir);
  } catch {
    return `✗ [Battery SDD] Track not found in .cooper/active/: ${trackId}`;
  }

  const config = await readBatteryConfig(batteryRoot);
  if (!config) {
    return "⚠️ [Battery SDD] No .batteryrc configuration found.";
  }

  const resolvedBarrels = await resolveBarrels(batteryRoot, config);
  const existingBarrels = resolvedBarrels.filter((b) => b.exists);
  const missingBarrels = resolvedBarrels.filter((b) => !b.exists);

  if (missingBarrels.length > 0) {
    const missingList = missingBarrels.map((b) => `  - ${b.name} (${b.path})`).join("\n");
    return `⚠️ [Battery SDD] Cannot dispatch track '${trackId}': some barrels are missing:\n${missingList}`;
  }

  return `✅ [Battery SDD] Track '${trackId}' dispatched successfully across ${existingBarrels.length} barrels:\n${existingBarrels.map((b) => `  ✓ ${b.name} (${b.path}) [${b.techStack}]`).join("\n")}`;
}
