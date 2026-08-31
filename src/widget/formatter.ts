import type { BatteryWidgetState } from "./state.js";

/**
 * Formats a single-line terminal UI widget text
 */
export function formatWidgetStatusBar(state: BatteryWidgetState): string {
  if (!state.isBatteryWorkspace) {
    return "";
  }

  const parts: string[] = [];

  const structureLabel = state.structure ? ` (${state.structure})` : "";
  parts.push(`[Battery: ${state.barrelCount} barrel${state.barrelCount === 1 ? "" : "s"}${structureLabel}]`);

  if (state.activeTrackId) {
    parts.push(`[Track: ${state.activeTrackId}]`);
    if (state.currentPhase) {
      parts.push(`[${state.currentPhase}]`);
    }
    if (state.progressText) {
      parts.push(`[Tasks: ${state.progressText}]`);
    }
  } else {
    parts.push("[Idle]");
  }

  return parts.join(" ");
}
