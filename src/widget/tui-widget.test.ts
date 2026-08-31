import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { TuiWidget } from "./tui-widget.js";
import type { ExtensionContext } from "../types.js";

describe("TuiWidget", () => {
  it("initializes, refreshes, and registers status bar item", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "tui-widget-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({ version: "1.0.0", structure: "multi-repo", barrels: [{ name: "auth", path: "./auth" }] })
      );

      const items: Array<{ id: string; text: string; tooltip?: string }> = [];
      const mockContext: ExtensionContext = {
        workspacePath: tmpDir,
        registerCommand: () => {},
        registerStatusBarItem: (item) => {
          items.push(item);
        },
      };

      const widget = new TuiWidget(mockContext);
      expect(widget.isAlive()).toBe(false);

      await widget.start();
      expect(widget.isAlive()).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]?.text).toContain("Battery");

      widget.dispose();
      expect(widget.isAlive()).toBe(false);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
