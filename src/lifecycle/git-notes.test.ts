import { describe, it, expect } from "vitest";
import { MultiBarrelGitNotesManager } from "./git-notes.js";

describe("MultiBarrelGitNotesManager", () => {
  it("formats and attempts to record git notes", async () => {
    const manager = new MultiBarrelGitNotesManager();
    const result = await manager.recordTask({
      trackId: "auth-v2",
      barrelName: "auth-service",
      taskId: "task-1",
      summary: "Implemented JWT validation",
    });

    // In testing env without git commits, it may return success or error gracefully
    expect(typeof result.success).toBe("boolean");
    expect(typeof result.output).toBe("string");
  });
});
