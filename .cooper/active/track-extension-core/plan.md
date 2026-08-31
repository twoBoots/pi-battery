# Implementation Plan: Multi-Barrel Pi Extension Core & Tooling

- **Track ID**: `track-extension-core`

## Phase 1: Core Types, Constants & Filesystem Utilities

- [x] Task: Types & Constants Definition
  - [x] Sub-task: Implement `src/types.ts` with type guards
  - [x] Sub-task: Implement `src/constants.ts` with command names
- [x] Task: Battery Filesystem & Barrel Resolution
  - [x] Sub-task: Implement `src/utils/battery-fs.ts` (.batteryrc and .batteryrc.local parser)
  - [x] Sub-task: Implement `src/utils/barrel.ts` (navigation and trust store sync)
  - [x] Sub-task: Implement `src/utils/format.ts` (status badges, progress bar, lists)

## Phase 2: Slash Commands & TUI Widget Implementation

- [x] Task: Slash Command Handlers
  - [x] Sub-task: Implement `status.ts`, `barrels.ts`, `tracks.ts`
  - [x] Sub-task: Implement `switch.ts`, `validate.ts`, `dispatch.ts`
- [x] Task: Persistent Terminal UI Widget
  - [x] Sub-task: Implement state loader, formatter, watcher, and `TuiWidget`

## Phase 3: Lifecycle Hooks & Extension Entrypoint

- [x] Task: Lifecycle SDD Governance
  - [x] Sub-task: Implement `spec-interceptor.ts`, `git-notes.ts`, `plan-watcher.ts`, `hooks.ts`
- [x] Task: Extension Activation & Vitest Verification
  - [x] Sub-task: Implement `src/index.ts` with default export
  - [x] Sub-task: Run Vitest coverage maintaining >80% threshold across all modules
