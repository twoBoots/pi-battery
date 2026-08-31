# Capability Spec: lifecycle-hooks

## Overview
Defines event-driven SDD governance across barrels, pre-tool / pre-commit spec delta validation, automated multi-barrel Git Notes, and phase gatekeeping.

---

## Requirements

### Requirement: Pre-Commit & Pre-Tool SDD Interceptor
The extension MUST enforce living spec deltas and cross-barrel contracts before staging or committing file modifications.

#### Scenario: File mutation intercepted
- GIVEN a file modification tool call (`write_to_file`, `replace_file_content`)
- WHEN the tool is about to execute
- THEN the interceptor validates that living spec deltas exist for the target barrel or active track.

#### Scenario: Pre-commit hook checks spec health
- GIVEN staged files in a git commit
- WHEN `git:preCommit` hook triggers
- THEN it verifies living spec validity and blocks the commit if violations exist.

---

### Requirement: Cross-Barrel Git Notes Manager
The extension MUST attach structured task completion summaries and multi-barrel sync records to `git notes`.

#### Scenario: Attaching task note across barrels
- GIVEN a task completed in an active multi-barrel track
- WHEN `recordTaskNote()` is executed
- THEN it writes structured task metadata into Git Notes for the affected barrel.
