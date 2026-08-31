# Capability Spec: barrel-sync

## Overview
Defines multi-repository barrel navigation, worktree switching across barrels using Pi's internal runtime context and `process.chdir()` to avoid subshell traps, and automated Pi trust store (`~/.pi/agent/trust.json`) synchronization.

---

## Requirements

### Requirement: Deterministic Barrel & Worktree Navigation
The extension MUST provide directory resolution and switching utilities that update `process.cwd()` and `context.workspacePath` directly.

#### Scenario: Switching to barrel path
- GIVEN a barrel configured with a relative path
- WHEN `switchWorkspace(targetPath, context)` is called
- THEN `process.cwd()` is changed to the resolved directory, `context.workspacePath` is updated, and the switch result returns success.

#### Scenario: Navigating to barrel worktree
- GIVEN a barrel containing a `.worktrees/<track_id>` directory
- WHEN `resolveBarrelWorktree(barrelPath, trackId)` is called
- THEN it resolves the canonical filesystem path and verifies existence.

---

### Requirement: Automated Project Trust Store Management
The extension MUST idempotently register target barrels and their worktrees in Pi's trust store (`~/.pi/agent/trust.json`).

#### Scenario: New barrel path trusted
- GIVEN a barrel path not yet in `~/.pi/agent/trust.json`
- WHEN `syncTrustRegistry(targetPath)` is invoked
- THEN the path is appended to `trustedPaths` in `~/.pi/agent/trust.json` atomically.

#### Scenario: Already trusted path
- GIVEN a path already in `~/.pi/agent/trust.json`
- WHEN `syncTrustRegistry(targetPath)` is invoked
- THEN the file remains unchanged and returns `added: false`.
