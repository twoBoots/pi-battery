import {
  findBatteryRoot,
  readBatteryTracks,
} from "../utils/battery-fs.js";
import { formatTracksList } from "../utils/format.js";

/**
 * Executes /battery:tracks in-process in <5ms
 */
export async function handleTracksCommand(workspacePath?: string): Promise<string> {
  const currentDir = workspacePath ?? process.cwd();
  const batteryRoot = await findBatteryRoot(currentDir);

  if (!batteryRoot) {
    return "⚠️ [Battery SDD] Not in a Battery workspace (no .batteryrc or .cooper/ directory found).";
  }

  const tracks = await readBatteryTracks(batteryRoot);

  return [
    `🛢️⚡ [Battery SDD] Multi-Barrel Tracks (${tracks.length}):`,
    formatTracksList(tracks),
  ].join("\n");
}
