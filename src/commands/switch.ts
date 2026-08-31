import {
  findBatteryRoot,
  readBatteryConfig,
  resolveBarrels,
} from "../utils/battery-fs.js";
import {
  resolveBarrelTarget,
  switchWorkspace,
  syncTrustRegistry,
} from "../utils/barrel.js";
import type { ExtensionContext } from "../types.js";

/**
 * Executes /battery:switch <target> in-process, switching process.cwd() and updating trust store
 */
export async function handleSwitchCommand(
  targetInput?: string,
  contextOrPath?: ExtensionContext | string
): Promise<string> {
  const context =
    typeof contextOrPath === "object" && contextOrPath !== null
      ? contextOrPath
      : undefined;

  const currentDir =
    typeof contextOrPath === "string"
      ? contextOrPath
      : context?.workspacePath ?? process.cwd();

  const batteryRoot = await findBatteryRoot(currentDir);

  if (!batteryRoot) {
    return "⚠️ [Battery SDD] Not in a Battery workspace (no .batteryrc or .cooper/ directory found).";
  }

  if (!targetInput || targetInput.trim() === "") {
    const config = await readBatteryConfig(batteryRoot);
    const resolved = config ? await resolveBarrels(batteryRoot, config) : [];
    const barrelsList = resolved.map((b) => `  - ${b.name} (${b.path})`).join("\n");
    return `⚠️ [Battery SDD] Usage: /battery:switch <barrel_name | barrel_name/track_id>\n\nAvailable barrels:\n${barrelsList || "  (None)"}`;
  }

  const resolved = await resolveBarrelTarget(batteryRoot, targetInput);

  if (!resolved.exists) {
    return `✗ [Battery SDD] Target destination not found: ${targetInput}\n  Resolved path: ${resolved.resolvedPath}`;
  }

  const switchResult = await switchWorkspace(resolved.resolvedPath, context);
  if (!switchResult.success) {
    return `✗ [Battery SDD] Failed to switch workspace to ${resolved.resolvedPath}: ${switchResult.error ?? "Unknown error"}`;
  }

  const trustResult = await syncTrustRegistry(switchResult.currentPath);
  const trustMsg = trustResult.added
    ? "Added to Pi trust store"
    : "Verified in Pi trust store";

  const targetLabel = resolved.barrelName
    ? `barrel: ${resolved.barrelName}${resolved.trackId ? ` (track: ${resolved.trackId})` : ""}`
    : resolved.trackId
      ? `track: ${resolved.trackId}`
      : "workspace root";

  return `✓ [Battery SDD] Switched workspace to ${targetLabel}\n  Current working directory: ${switchResult.currentPath}\n  Trust: ${trustMsg}`;
}
