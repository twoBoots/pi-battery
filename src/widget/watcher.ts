import * as path from "node:path";
import * as fs from "node:fs";
import { findBatteryRoot } from "../utils/battery-fs.js";

export type StateChangeCallback = () => void | Promise<void>;

/**
 * File system watcher monitoring .batteryrc, .batteryrc.local, and .cooper/active/
 */
export class BatteryStateWatcher {
  private watchers: fs.FSWatcher[] = [];
  private readonly workspacePath: string;
  private readonly callback: StateChangeCallback;
  private isWatching = false;

  constructor(workspacePath: string, callback: StateChangeCallback) {
    this.workspacePath = workspacePath;
    this.callback = callback;
  }

  public async start(): Promise<void> {
    if (this.isWatching) {
      return;
    }

    const root = await findBatteryRoot(this.workspacePath);
    if (!root) {
      return;
    }

    const pathsToWatch = [
      path.join(root, ".batteryrc"),
      path.join(root, ".batteryrc.local"),
      path.join(root, ".cooper", "active"),
    ];

    for (const targetPath of pathsToWatch) {
      try {
        const watcher = fs.watch(targetPath, { recursive: true }, () => {
          void this.callback();
        });
        this.watchers.push(watcher);
      } catch {
        // file or dir may not exist yet
      }
    }

    this.isWatching = true;
  }

  public stop(): void {
    for (const watcher of this.watchers) {
      try {
        watcher.close();
      } catch {
        // ignore close errors
      }
    }
    this.watchers = [];
    this.isWatching = false;
  }

  public isActive(): boolean {
    return this.isWatching;
  }
}
