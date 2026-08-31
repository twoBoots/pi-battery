import { describe, it, expect, vi } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { BatteryStateWatcher } from "./watcher.js";

describe("BatteryStateWatcher", () => {
  it("starts and stops watcher cleanly", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "watcher-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({ version: "1.0.0", structure: "multi-repo", barrels: [] })
      );

      const callback = vi.fn();
      const watcher = new BatteryStateWatcher(tmpDir, callback);

      expect(watcher.isActive()).toBe(false);
      await watcher.start();
      expect(watcher.isActive()).toBe(true);

      // Calling start again should be a no-op
      await watcher.start();
      expect(watcher.isActive()).toBe(true);

      watcher.stop();
      expect(watcher.isActive()).toBe(false);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles non-battery workspace gracefully", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "watcher-test-"));
    try {
      const callback = vi.fn();
      const watcher = new BatteryStateWatcher(tmpDir, callback);
      await watcher.start();
      expect(watcher.isActive()).toBe(false);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
