# Product Definition

## Vision
**pi-battery** is the official, native [Pi Coding Agent](https://pi.dev) extension for [Battery](https://github.com/twoBoots/battery) — the multi-repository Specification-Driven Development (SDD) orchestration protocol. Built on top of [Cooper](https://github.com/twoBoots/cooper) and [Troop](https://github.com/twoBoots/troop), `pi-battery` coordinates multi-repository tracks, cross-barrel living capability specs, and isolated worktree lifecycles directly within the Pi agent runtime.

## Target Audience
- **Developers & Multi-Repo Engineers**: Orchestrating complex feature epics, shared interface contracts, and multi-package architectures using the Pi Coding Agent.
- **Autonomous Coding Agents**: Navigating across heterogeneous barrels (repositories/packages), switching worktree contexts deterministically, and adhering to cross-barrel SDD guardrails.

## Core Capabilities & Scope
- **`extension-core`**: Core extension entrypoint, lifecycle initialization, configuration loading (`.batteryrc` and `.batteryrc.local`), and Pi Agent Core runtime bindings.
- **`slash-commands`**: Zero-cost, in-process human slash commands (`/battery:status`, `/battery:barrels`, `/battery:tracks`, `/battery:switch`, `/battery:validate`, `/battery:dispatch`) executing in `<5ms` with 0 LLM token overhead.
- **`barrel-sync`**: Multi-repo barrel navigation, worktree switching across barrels utilizing Pi internal runtime context and `process.chdir()` to eliminate subshell traps, and automated Pi trust store (`~/.pi/agent/trust.json`) management.
- **`tui-widget`**: Persistent terminal UI status bar displaying workspace topology, registered barrels, active multi-barrel track progress, and spec health.
- **`lifecycle-hooks`**: Cross-barrel contract governance, pre-tool / pre-commit spec delta validation, automated multi-barrel Git Notes, and phase gatekeeping.
- **`multi-barrel-dispatch`**: Coordination and dispatching of track specifications, plans, and spec deltas across participating downstream barrels.

## Quality & Non-Functional Goals
- **Instant Slash Commands**: Sub-5ms execution time for in-process commands with 0 LLM token overhead.
- **Subshell Trap Immunity**: Clean process-level directory switching and trust synchronization across barrels and worktrees.
- **Code Coverage**: Strict TDD methodology maintaining >80% test coverage.
- **Type Safety**: Strictly typed TypeScript ESM codebase conforming to `@earendil-works/pi-agent-core` extension standards.
