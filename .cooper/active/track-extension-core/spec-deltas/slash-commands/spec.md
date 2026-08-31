# Spec Delta: slash-commands

## Requirements

### + Requirement: In-Process Slash Command Handlers
The extension MUST provide dedicated command handlers for all registered Battery slash commands executing in `<5ms` in-process.

#### + Scenario: Status command returns formatted workspace summary
- GIVEN configured barrels and active tracks
- WHEN /battery:status is executed
- THEN it returns a formatted terminal output with topology, barrel tech stacks, and track progress.

#### + Scenario: Barrels command returns registered barrels list
- GIVEN barrels configured in .batteryrc
- WHEN /battery:barrels is executed
- THEN it lists all barrels, their paths, types, and resolved tech stacks.

#### + Scenario: Switch command resolves barrel root or worktree
- GIVEN a valid barrel name or barrel/track target
- WHEN /battery:switch <target> is executed
- THEN it navigates the session workspace to the target directory and syncs Pi trust.
