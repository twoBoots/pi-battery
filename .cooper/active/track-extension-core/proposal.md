# Proposal: Multi-Barrel Pi Extension Core & Tooling

## Intent
Provide native Pi extension integration for `twoBoots/battery`, bridging multi-repo SDD orchestration, deterministic barrel switching, 0-token slash commands, real-time TUI status widget, and cross-barrel lifecycle governance.

## Scope
- Native TypeScript ESM package conforming to `@earendil-works/pi-agent-core`
- Slash commands: `/battery:status`, `/battery:barrels`, `/battery:tracks`, `/battery:switch`, `/battery:validate`, `/battery:dispatch`
- Deterministic `process.chdir()` workspace switching across barrels and worktrees
- Automated Pi trust store synchronization (`~/.pi/agent/trust.json`)
- Pre-commit and pre-tool SDD spec validation
