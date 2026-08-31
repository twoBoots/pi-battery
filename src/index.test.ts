import { describe, it, expect, vi } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import activate, { BatteryExtension } from "./index.js";
import { COMMANDS } from "./constants.js";
import type { ExtensionContext } from "./types.js";

describe("Extension Entrypoint (activate)", () => {
  it("exports default activate function", () => {
    expect(typeof activate).toBe("function");
  });

  it("registers slash commands and lifecycle hooks with the Pi runtime context", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "battery-index-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [{ name: "auth", path: "./auth" }],
        })
      );

      const registeredCommands = new Map<string, (...args: unknown[]) => Promise<unknown> | unknown>();
      const registeredStatusBar: unknown[] = [];
      const registeredEvents = new Map<string, (...args: unknown[]) => void>();

      const mockContext: ExtensionContext = {
        workspacePath: tmpDir,
        registerCommand: vi.fn((name, handler) => {
          registeredCommands.set(name, handler);
        }),
        registerStatusBarItem: vi.fn((item) => {
          registeredStatusBar.push(item);
        }),
        on: vi.fn((event, listener) => {
          registeredEvents.set(event, listener);
        }),
      };

      const instance = activate(mockContext);
      await instance.getTuiWidget().refresh();

      expect(instance).toBeInstanceOf(BatteryExtension);
      expect(mockContext.registerCommand).toHaveBeenCalledTimes(6);
      expect(registeredCommands.has(COMMANDS.STATUS)).toBe(true);
      expect(registeredCommands.has(COMMANDS.BARRELS)).toBe(true);
      expect(registeredCommands.has(COMMANDS.TRACKS)).toBe(true);
      expect(registeredCommands.has(COMMANDS.SWITCH)).toBe(true);
      expect(registeredCommands.has(COMMANDS.VALIDATE)).toBe(true);
      expect(registeredCommands.has(COMMANDS.DISPATCH)).toBe(true);
      expect(registeredStatusBar.length).toBeGreaterThanOrEqual(1);
      expect(mockContext.on).toHaveBeenCalled();
      expect(registeredEvents.has("tool:beforeExecute")).toBe(true);

      // Verify lifecycle subsystems are accessible on instance
      expect(instance.getInterceptor()).toBeDefined();
      expect(instance.getGitNotesManager()).toBeDefined();
      expect(instance.getPlanWatcher()).toBeDefined();

      // Test handler execution
      const statusHandler = registeredCommands.get(COMMANDS.STATUS)!;
      const barrelsHandler = registeredCommands.get(COMMANDS.BARRELS)!;
      const tracksHandler = registeredCommands.get(COMMANDS.TRACKS)!;
      const switchHandler = registeredCommands.get(COMMANDS.SWITCH)!;
      const validateHandler = registeredCommands.get(COMMANDS.VALIDATE)!;
      const dispatchHandler = registeredCommands.get(COMMANDS.DISPATCH)!;

      expect(await statusHandler()).toContain("Topology");
      expect(await barrelsHandler()).toContain("Barrels");
      expect(await tracksHandler()).toContain("Tracks");
      expect(await switchHandler("auth")).toContain("auth");
      expect(await validateHandler()).toContain("Validation");
      expect(await dispatchHandler("")).toContain("Usage: /battery:dispatch");

      instance.dispose();
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles contexts without optional statusBar or event emitter registration gracefully", () => {
    const mockContext: ExtensionContext = {
      workspacePath: "/workspace/test",
      registerCommand: vi.fn(),
    };

    const instance = activate(mockContext);
    expect(instance).toBeInstanceOf(BatteryExtension);
    instance.dispose();
  });

  it("does not re-register if initialize is called twice", () => {
    const mockContext: ExtensionContext = {
      workspacePath: "/workspace/test",
      registerCommand: vi.fn(),
      registerStatusBarItem: vi.fn(),
    };

    const instance = activate(mockContext);
    expect(mockContext.registerCommand).toHaveBeenCalledTimes(6);

    instance.initialize();
    expect(mockContext.registerCommand).toHaveBeenCalledTimes(6);
    instance.dispose();
  });

  it("integrates TuiWidget and disposes cleanly", async () => {
    const mockContext: ExtensionContext = {
      workspacePath: "/workspace/test",
      registerCommand: vi.fn(),
      registerStatusBarItem: vi.fn(),
    };

    const instance = activate(mockContext);
    const widget = instance.getTuiWidget();
    expect(widget).toBeDefined();

    instance.dispose();
    expect(widget.isAlive()).toBe(false);
  });
});
