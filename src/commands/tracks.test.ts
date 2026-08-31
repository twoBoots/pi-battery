import { describe, it, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { handleTracksCommand } from "./tracks.js";

describe("handleTracksCommand", () => {
  it("returns error if not in Battery workspace", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "tracks-cmd-test-"));
    try {
      const output = await handleTracksCommand(tmpDir);
      expect(output).toContain("Not in a Battery workspace");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("lists active multi-barrel tracks", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "tracks-cmd-test-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".batteryrc"),
        JSON.stringify({
          version: "1.0.0",
          structure: "multi-repo",
          barrels: [],
        })
      );
      const trackDir = path.join(tmpDir, ".cooper", "active", "auth-v2");
      await fs.mkdir(trackDir, { recursive: true });
      await fs.writeFile(
        path.join(trackDir, "metadata.json"),
        JSON.stringify({
          track_id: "auth-v2",
          title: "Auth V2",
          type: "feature",
          status: "in_progress",
          created_at: "2026-08-31",
        })
      );

      const output = await handleTracksCommand(tmpDir);
      expect(output).toContain("Multi-Barrel Tracks (1)");
      expect(output).toContain("Auth V2");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
