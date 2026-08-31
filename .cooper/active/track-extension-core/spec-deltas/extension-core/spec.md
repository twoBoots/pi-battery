# Spec Delta: extension-core

## Requirements

### + Requirement: Extension Activation & Lifecycle
The extension MUST export a default `activate(context: ExtensionContext)` function that initializes slash commands, the persistent TUI status bar, and lifecycle hooks.

#### + Scenario: Extension activates in Pi runtime
- GIVEN a valid `ExtensionContext` provided by the Pi agent runtime
- WHEN `activate(context)` is called
- THEN it registers slash commands, starts the TUI widget, attaches lifecycle event listeners, and returns the active extension instance.

### + Requirement: Layered Battery Configuration Loading
The extension MUST load and merge configuration from canonical `.batteryrc` and local developer overrides in `.batteryrc.local`.

#### + Scenario: Reading valid .batteryrc
- GIVEN a workspace containing a valid `.batteryrc`
- WHEN configuration is loaded
- THEN it parses the structure (`multi-repo`, `monorepo`, `custom`) and lists all registered barrels.
