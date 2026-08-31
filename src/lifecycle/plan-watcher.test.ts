import { describe, it, expect, vi } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { MultiBarrelPlanWatcher } from "./plan-watcher.js";

describe("MultiBarrelPlanWatcher", () => {
  it("emits events to registered listeners on plan check", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "plan-watcher-test-"));
    try {
      const planPath = path.join(tmpDir, "plan.md");
      await fs.writeFile(planPath, "## Phase 1\n- [x] Task [auth]: Done\n- [ ] Task [web]: Todo");

      const watcher = new MultiBarrelPlanWatcher();
      const listener = vi.fn();
      watcher.onPlanUpdated(listener);

      const summary = await watcher.checkPlan(planPath);
      expect(summary.totalTasks).toBe(2);
      expect(summary.completedTasks).toBe(1);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          planFilePath: planPath,
          summary,
        })
      );
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
