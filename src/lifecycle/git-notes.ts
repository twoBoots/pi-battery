import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GitNotesManagerOptions {
  workspacePath?: string;
}

export interface TaskRecordPayload {
  trackId: string;
  barrelName?: string;
  taskId: string;
  summary: string;
  timestamp?: string;
}

/**
 * Manages appending structured SDD metadata to git notes
 */
export class MultiBarrelGitNotesManager {
  private readonly workspacePath: string;

  constructor(options: GitNotesManagerOptions = {}) {
    this.workspacePath = options.workspacePath ?? process.cwd();
  }

  public async recordTask(payload: TaskRecordPayload): Promise<{ success: boolean; output: string }> {
    const timestamp = payload.timestamp ?? new Date().toISOString();
    const barrelLabel = payload.barrelName ? `[${payload.barrelName}] ` : "";
    const message = `[Battery SDD] ${barrelLabel}Track: ${payload.trackId} | Task: ${payload.taskId}\nCompleted At: ${timestamp}\nSummary: ${payload.summary}`;

    try {
      const { stdout } = await execFileAsync("git", ["notes", "append", "-m", message], {
        cwd: this.workspacePath,
      });
      return { success: true, output: stdout.trim() };
    } catch (err) {
      return {
        success: false,
        output: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
