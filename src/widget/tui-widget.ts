import type { ExtensionContext } from "../types.js";
import { formatWidgetStatusBar } from "./formatter.js";
import { loadBatteryWidgetState, type BatteryWidgetState } from "./state.js";
import { BatteryStateWatcher } from "./watcher.js";

/**
 * TUI Status Widget managing the terminal status bar display
 */
export class TuiWidget {
  private readonly context: ExtensionContext;
  private watcher: BatteryStateWatcher | null = null;
  private state: BatteryWidgetState = {
    isBatteryWorkspace: false,
    barrelCount: 0,
    specStatus: "none",
  };
  private isRunning = false;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    await this.refresh();

    this.watcher = new BatteryStateWatcher(
      this.context.workspacePath ?? process.cwd(),
      () => {
        void this.refresh();
      }
    );
    await this.watcher.start();
  }

  public async refresh(): Promise<void> {
    this.state = await loadBatteryWidgetState(
      this.context.workspacePath ?? process.cwd()
    );

    const displayText = formatWidgetStatusBar(this.state);
    if (displayText && typeof this.context.registerStatusBarItem === "function") {
      this.context.registerStatusBarItem({
        id: "pi-battery-status",
        text: displayText,
        tooltip: "Battery Multi-Repository SDD Status",
      });
    }
  }

  public dispose(): void {
    if (this.watcher) {
      this.watcher.stop();
      this.watcher = null;
    }
    this.isRunning = false;
  }

  public getState(): BatteryWidgetState {
    return this.state;
  }

  public isAlive(): boolean {
    return this.isRunning;
  }
}
