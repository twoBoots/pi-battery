# pi-battery 🛢️⚡🥧

> **Native [Pi Coding Agent](https://pi.dev) extension for [Battery](https://github.com/twoBoots/battery) — the Multi-Repository SDD Orchestration Protocol.**

---

## 🎯 Intent & Overview

**Battery** is an open, agent-agnostic and repository-agnostic multi-repository Specification-Driven Development (SDD) orchestration protocol built on top of **[Cooper](https://github.com/twoBoots/cooper)** and **[Troop](https://github.com/twoBoots/troop)**. It coordinates multi-repository tracks, shared API contracts, and living capability specs across a **collection of barrels** (individual repositories or packages) for human developers and autonomous AI agents.

While Battery provides a compiled CLI (`battery`) and Model Context Protocol server (`battery mcp`), the **[Pi Coding Agent](https://pi.dev)** thrives with native, in-process TypeScript extensions:
1. **Zero-Token Slash Commands**: In-process execution in `<5ms` with **0 LLM token overhead** and **0 API cost**.
2. **Deterministic Workspace Navigation**: Switches between the battery root, barrel roots, and barrel worktrees via `process.chdir()` to prevent Pi subshell isolation traps.
3. **Automated Project Trust**: Automatically syncs barrel directories and worktrees with Pi's trust registry (`~/.pi/agent/trust.json`).
4. **Persistent Terminal UI**: Real-time status bar displaying workspace topology, barrel counts, and active multi-barrel track progress.
5. **Cross-Barrel SDD Guardrails**: Pre-tool and pre-commit hooks enforcing living spec deltas and cross-barrel contract integrity.

**`pi-battery`** bridges the entire Battery multi-repo orchestration lifecycle directly into the Pi agent runtime.

---

## 🏗️ Core Architecture & Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Pi Terminal Session                           │
│                                                                        │
│  [Battery: multi-repo (3 barrels)]  [Track: auth-v2]  [Barrels: 2/3]   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  > /battery:status                                                     │
│    Topology: multi-repo (3 registered barrels)                         │
│    • auth-service (../auth-service) [Go 1.22]                          │
│    • web-dashboard (../web-dashboard) [TypeScript/React]               │
│    • billing-api (../billing-api) [Rust 1.78]                          │
│    • Active Track: auth-v2 (2/3 barrels synced)                        │
│                                                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                     ┌──────────────▼──────────────┐
                     │         pi-battery          │
                     │    (Native Pi Extension)    │
                     └──────┬───────┬───────┬──────┘
                            │       │       │
       ┌────────────────────┘       │       └────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  Workspace   │             │  Lifecycle   │             │  In-Process  │
│  & Barrels   │             │ Event Hooks  │             │Tool Registry │
│              │             │              │             │              │
│• Switch Dir  │             │• Multi-Notes │             │• Barrel ops  │
│• Auto-Trust  │             │• Guardrails  │             │• Track ops   │
│• Worktrees   │             │• Contracts   │             │• Spec audit  │
└──────┬───────┘             └──────┬───────┘             └──────┬───────┘
       │                            │                            │
       └────────────────────┬───────┴────────────────────────────┘
                            ▼
             ┌─────────────────────────────────────────────┐
             │          Battery Engine / Config            │
             │      (.batteryrc | .cooper/ | Barrels)      │
             └─────────────────────────────────────────────┘
```

---

## ⚡ Key Feature Scope

### 1. Zero-Cost Human Slash Commands
Slash commands execute in `<5ms` inside the Pi process with **0 LLM token consumption**:
* `/battery:status` — Displays workspace topology, barrel connectivity, resolved tech stacks, and active track progress.
* `/battery:barrels` — Lists all registered barrels and sub-batteries with their paths and tech stacks.
* `/battery:tracks` — Lists multi-barrel tracks (active, proposed, and archived).
* `/battery:switch <barrel|barrel/track>` — Switches Pi's active working directory directly to a target barrel or barrel worktree.
* `/battery:validate` — Validates `.batteryrc`, barrel paths connectivity, cross-barrel specs, and spec deltas.
* `/battery:dispatch <track_id>` — Coordinates and verifies track dispatch readiness across downstream barrels.

### 2. Multi-Repo Barrel & Worktree Synchronization
* **Resolves Subshell Traps**: Uses `process.chdir()` and updates `context.workspacePath` so that Pi's core tools (`read`, `write`, `edit`, `bash`) operate in the correct barrel or worktree.
* **Automated Project Trust**: Automatically registers barrel paths and isolated worktrees (`.worktrees/*`) in Pi's trust store (`~/.pi/agent/trust.json`).

### 3. Persistent Terminal UI (TUI Status Bar)
* Injects a real-time status bar into Pi's terminal interface:
  ```text
  [Battery: multi-repo (3 barrels)] [Track: auth-v2] [Barrels: 2/3 synced]
  ```

### 4. Lifecycle Event Hooks & SDD Governance
* **Pre-Commit / Pre-Tool Interceptor**: Validates living spec deltas and cross-barrel interface contracts before files are modified or committed.
* **Multi-Barrel Git Notes**: Attaches structured task execution records and phase checkpoints to `git notes`.

---

## 📦 Technical Stack & Distribution

* **Language**: TypeScript (ES2022+ / ESM)
* **Target Runtime**: Pi Coding Agent extension ecosystem (`@earendil-works/pi-agent-core`)
* **Underlying Engine**: Battery CLI (`battery`) + `.batteryrc` + Cooper SDD (`.cooper/`)
* **Distribution**:
  * Git: `pi install github:twoBoots/pi-battery`
  * Project-Local: Scaffolded into `.pi/extensions/battery.ts`

---

## 🛠️ Development & Contributing

This project follows the **Cooper Spec-Driven Development (SDD)** lifecycle and **[Troop](https://github.com/twoBoots/troop)** worktree isolation:
- **Operational Rules & Skills**: See [`AGENTS.md`](./AGENTS.md) and [`.cooper/definition/workflow.md`](./.cooper/definition/workflow.md).
- **Living Capability Specs**: Baseline specifications are maintained under [`.cooper/specs/`](./.cooper/specs/).
- **Tracks & Worktrees**: Features, bug fixes, and chores are developed in isolated worktrees using Cooper tracks (`cooper track create <track_id>`).
