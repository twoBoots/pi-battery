import type { BatteryTrackMetadata, ResolvedBarrel } from "../types.js";

export interface ValidationIssue {
  file: string;
  line?: number;
  message: string;
}

/**
 * Returns a styled terminal badge for track or barrel status
 */
export function formatStatusBadge(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "[✓ Completed]";
    case "in_progress":
      return "[▶ In Progress]";
    case "review":
      return "[🔍 Review]";
    case "new":
      return "[★ New]";
    case "archived":
      return "[📦 Archived]";
    default:
      return `[${status}]`;
  }
}

/**
 * Renders an ASCII progress bar (e.g. [=====>     ] 4/7 (57%))
 */
export function renderProgressBar(
  completed: number,
  total: number,
  width = 12
): string {
  if (total <= 0) {
    return "[            ] 0/0 (0%)";
  }

  const clampedCompleted = Math.max(0, Math.min(completed, total));
  const fraction = clampedCompleted / total;
  const filledChars = Math.round(fraction * width);
  const emptyChars = Math.max(0, width - filledChars);

  let bar = "";
  if (filledChars === width) {
    bar = "=".repeat(width);
  } else if (filledChars > 0) {
    bar = "=".repeat(filledChars - 1) + ">" + " ".repeat(emptyChars);
  } else {
    bar = " ".repeat(width);
  }

  const percent = Math.round(fraction * 100);
  return `[${bar}] ${clampedCompleted}/${total} (${percent}%)`;
}

/**
 * Formats a list of resolved barrels into terminal output
 */
export function formatBarrelsList(barrels: ResolvedBarrel[]): string {
  if (barrels.length === 0) {
    return "  (No barrels configured)";
  }

  return barrels
    .map((b) => {
      const statusIcon = b.exists ? "✓" : "✗ (missing)";
      const typeLabel = b.type === "battery" ? "[Battery]" : "[Barrel]";
      return `  • ${b.name} (${b.path}) ${typeLabel} - ${b.techStack} [${statusIcon}]`;
    })
    .join("\n");
}

/**
 * Formats a list of battery tracks into terminal output
 */
export function formatTracksList(tracks: BatteryTrackMetadata[]): string {
  if (tracks.length === 0) {
    return "  (No active tracks)";
  }

  return tracks
    .map((t) => {
      const badge = formatStatusBadge(t.status);
      const barrels = t.barrels ? ` [Barrels: ${t.barrels.join(", ")}]` : "";
      return `  • ${t.title} (${t.track_id}) ${badge}${barrels}`;
    })
    .join("\n");
}

/**
 * Formats validation audit results
 */
export function formatValidationReport(
  isValid: boolean,
  issues: ValidationIssue[]
): string {
  if (isValid) {
    return "✅ [Battery SDD] All configuration, barrels, and capability specifications are valid.";
  }

  const issueLines = issues
    .map((i) => `  - ${i.file}${i.line ? `:${i.line}` : ""}: ${i.message}`)
    .join("\n");

  return `❌ [Battery SDD] Validation failed with ${issues.length} issue(s):\n${issueLines}`;
}
