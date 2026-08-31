# Product Guidelines

## Design Principles
1. **Zero-Token Slash Commands**: Slash commands must execute entirely in-process in `<5ms` without invoking LLM tokens.
2. **Deterministic Workspace Navigation**: Switching barrels or worktrees must use `process.chdir()` and update `context.workspacePath` directly so that Pi's core tools (`read`, `write`, `edit`, `bash`) operate in the correct root.
3. **Decoupled Barrel Tech Stacks**: Never assume all barrels share the same runtime. Always resolve each barrel's individual tech stack from `<barrel>/.cooper/definition/tech-stack.md`.
4. **Layered Configuration**: Always read canonical `.batteryrc` and merge local developer overrides from `.batteryrc.local`.
5. **Cross-Barrel SDD Guardrails**: Enforce living spec deltas and cross-barrel contract consistency before staging or committing changes.
