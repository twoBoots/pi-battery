import { COMMANDS } from "./constants.js";
import type { ExtensionContext } from "./types.js";
import { handleStatusCommand } from "./commands/status.js";
import { handleBarrelsCommand } from "./commands/barrels.js";
import { handleTracksCommand } from "./commands/tracks.js";
import { handleSwitchCommand } from "./commands/switch.js";
import { handleValidateCommand } from "./commands/validate.js";
import { handleDispatchCommand } from "./commands/dispatch.js";
import { TuiWidget } from "./widget/tui-widget.js";
import { CrossBarrelSpecInterceptor } from "./lifecycle/spec-interceptor.js";
import { MultiBarrelGitNotesManager } from "./lifecycle/git-notes.js";
import { MultiBarrelPlanWatcher } from "./lifecycle/plan-watcher.js";
import { handlePreCommitHook, handlePreToolHook } from "./lifecycle/hooks.js";

/**
 * Main Battery Extension instance running in the Pi agent runtime
 */
export class BatteryExtension {
  private readonly context: ExtensionContext;
  private readonly tuiWidget: TuiWidget;
  private readonly interceptor: CrossBarrelSpecInterceptor;
  private readonly gitNotesManager: MultiBarrelGitNotesManager;
  private readonly planWatcher: MultiBarrelPlanWatcher;
  private isInitialized = false;

  constructor(context: ExtensionContext) {
    this.context = context;
    this.tuiWidget = new TuiWidget(context);
    this.interceptor = new CrossBarrelSpecInterceptor({
      workspacePath: context.workspacePath,
    });
    this.gitNotesManager = new MultiBarrelGitNotesManager({
      workspacePath: context.workspacePath,
    });
    this.planWatcher = new MultiBarrelPlanWatcher();
  }

  /**
   * Initializes extension components, registers commands, and sets up lifecycle hooks and TUI widget
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.registerSlashCommands();
    void this.tuiWidget.start();
    this.registerLifecycleHooks();
    this.isInitialized = true;
  }

  /**
   * Disposes extension resources and stops background watchers
   */
  public dispose(): void {
    this.tuiWidget.dispose();
    this.isInitialized = false;
  }

  public getTuiWidget(): TuiWidget {
    return this.tuiWidget;
  }

  public getInterceptor(): CrossBarrelSpecInterceptor {
    return this.interceptor;
  }

  public getGitNotesManager(): MultiBarrelGitNotesManager {
    return this.gitNotesManager;
  }

  public getPlanWatcher(): MultiBarrelPlanWatcher {
    return this.planWatcher;
  }

  private registerSlashCommands(): void {
    this.context.registerCommand(COMMANDS.STATUS, async () => {
      const result = await handleStatusCommand(this.context.workspacePath);
      void this.tuiWidget.refresh();
      return result;
    });

    this.context.registerCommand(COMMANDS.BARRELS, async () => {
      return handleBarrelsCommand(this.context.workspacePath);
    });

    this.context.registerCommand(COMMANDS.TRACKS, async () => {
      return handleTracksCommand(this.context.workspacePath);
    });

    this.context.registerCommand(COMMANDS.SWITCH, async (...args: unknown[]) => {
      const target = typeof args[0] === "string" ? args[0] : undefined;
      const result = await handleSwitchCommand(target, this.context);
      void this.tuiWidget.refresh();
      return result;
    });

    this.context.registerCommand(COMMANDS.VALIDATE, async () => {
      const result = await handleValidateCommand(this.context.workspacePath);
      void this.tuiWidget.refresh();
      return result;
    });

    this.context.registerCommand(COMMANDS.DISPATCH, async (...args: unknown[]) => {
      const trackId = typeof args[0] === "string" ? args[0] : undefined;
      const result = await handleDispatchCommand(trackId, this.context.workspacePath);
      void this.tuiWidget.refresh();
      return result;
    });
  }

  private registerLifecycleHooks(): void {
    if (typeof this.context.on === "function") {
      this.context.on("tool:beforeExecute", async (event: unknown) => {
        const payload = event as { toolName?: string; toolArgs?: Record<string, unknown> } | undefined;
        if (payload?.toolName) {
          return handlePreToolHook({
            toolName: payload.toolName,
            toolArgs: payload.toolArgs,
            workspacePath: this.context.workspacePath,
          });
        }
        return { allowed: true };
      });

      this.context.on("git:preCommit", async (event: unknown) => {
        const payload = event as { stagedFiles?: string[]; bypass?: boolean } | undefined;
        return handlePreCommitHook({
          workspacePath: this.context.workspacePath,
          stagedFiles: payload?.stagedFiles,
          bypass: payload?.bypass,
        });
      });
    }
  }
}

/**
 * Extension activation entrypoint conforming to Pi Agent Core extension standard
 */
export default function activate(context: ExtensionContext): BatteryExtension {
  const extension = new BatteryExtension(context);
  extension.initialize();
  return extension;
}

export * from "./types.js";
export * from "./constants.js";
export * from "./utils/battery-fs.js";
export * from "./utils/barrel.js";
export * from "./utils/format.js";
export * from "./commands/status.js";
export * from "./commands/barrels.js";
export * from "./commands/tracks.js";
export * from "./commands/switch.js";
export * from "./commands/validate.js";
export * from "./commands/dispatch.js";
export * from "./widget/state.js";
export * from "./widget/formatter.js";
export * from "./widget/watcher.js";
export * from "./widget/tui-widget.js";
export * from "./lifecycle/spec-interceptor.js";
export * from "./lifecycle/git-notes.js";
export * from "./lifecycle/plan-watcher.js";
export * from "./lifecycle/hooks.js";
