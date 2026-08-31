# Spec Delta: barrel-sync

## Requirements

### + Requirement: Deterministic Barrel & Worktree Navigation
The extension MUST provide directory resolution and switching utilities that update `process.cwd()` and `context.workspacePath` directly.

#### + Scenario: Switching to barrel path
- GIVEN a barrel configured with a relative path
- WHEN `switchWorkspace(targetPath, context)` is called
- THEN `process.cwd()` is changed to the resolved directory, `context.workspacePath` is updated, and the switch result returns success.

#### + Scenario: Navigating to barrel worktree
- GIVEN a barrel containing a `.worktrees/<track_id>` directory
- WHEN `resolveBarrelWorktree(barrelPath, trackId)` is called
- THEN it resolves the canonical filesystem path and verifies existence.
