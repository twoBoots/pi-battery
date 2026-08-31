import {
  findBatteryRoot,
  readBatteryConfig,
  resolveBarrels,
} from "../utils/battery-fs.js";
import { formatBarrelsList } from "../utils/format.js";

/**
 * Executes /battery:barrels in-process in <5ms
 */
export async function handleBarrelsCommand(workspacePath?: string): Promise<string> {
  const currentDir = workspacePath ?? process.cwd();
  const batteryRoot = await findBatteryRoot(currentDir);

  if (!batteryRoot) {
    return "⚠️ [Battery SDD] Not in a Battery workspace (no .batteryrc or .cooper/ directory found).";
  }

  const config = await readBatteryConfig(batteryRoot);
  if (!config) {
    return "⚠️ [Battery SDD] No .batteryrc configuration found.";
  }

  const resolvedBarrels = await resolveBarrels(batteryRoot, config);

  return [
    `🛢️⚡ [Battery SDD] Registered Barrels (${resolvedBarrels.length}):`,
    formatBarrelsList(resolvedBarrels),
  ].join("\n");
}
