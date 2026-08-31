# Design: Multi-Barrel Pi Extension Core & Tooling

## Architecture
Modular architecture decoupling filesystem parsing, barrel navigation, command dispatching, terminal UI widgets, and lifecycle hooks.

## Key Subsystems
1. **FS & Config Engine (`src/utils/battery-fs.ts`)**: Resolves `.batteryrc`, `.batteryrc.local`, and barrel `.cooper/definition/tech-stack.md`.
2. **Barrel Navigation (`src/utils/barrel.ts`)**: Updates `process.cwd()` and syncs Pi trust store.
3. **Slash Commands (`src/commands/`)**: 0-token handlers for `/battery:*`.
4. **TUI Widget (`src/widget/`)**: Reactive status bar updating on filesystem changes.
5. **Lifecycle Hooks (`src/lifecycle/`)**: Cross-barrel spec interceptor and git notes metadata recorder.
