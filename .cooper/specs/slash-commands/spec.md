# Capability Spec: slash-commands

## Overview
Defines zero-cost, in-process human slash commands executing within `<5ms` in the Pi runtime with 0 LLM token consumption and 0 API cost.

---

## Requirements

### Requirement: Workspace & Barrel Status Command (`/battery:status`)
The extension MUST provide `/battery:status` to inspect workspace topology, registered barrel connectivity, resolved tech stacks, and active multi-barrel track progress.

#### Scenario: Active multi-barrel tracks exist
- GIVEN registered barrels and an active track in `.cooper/active/`
- WHEN user invokes `/battery:status`
- THEN it outputs the workspace topology, barrel counts, resolved tech stacks, and active track progress in `<5ms`.

#### Scenario: No active track selected
- GIVEN registered barrels with no active track currently in progress
- WHEN user invokes `/battery:status`
- THEN it renders the battery status as Idle and displays registered barrels.

---

### Requirement: Barrels List Command (`/battery:barrels`)
The extension MUST provide `/battery:barrels` displaying all configured barrels, their paths, types, and resolved tech stacks.

#### Scenario: Listing barrels
- GIVEN barrels defined in `.batteryrc`
- WHEN user invokes `/battery:barrels`
- THEN it displays each barrel's name, relative path, type (barrel or battery), and detected tech stack.

---

### Requirement: Multi-Barrel Tracks Command (`/battery:tracks`)
The extension MUST provide `/battery:tracks` displaying active, proposed, and archived multi-barrel tracks.

#### Scenario: Listing tracks
- GIVEN multi-barrel tracks in `.cooper/tracks.md` or `.cooper/active/`
- WHEN user invokes `/battery:tracks`
- THEN it presents active tracks with participating barrels and completion progress.

---

### Requirement: Workspace Switching Command (`/battery:switch <target>`)
The extension MUST provide `/battery:switch` to change the active session workspace to a target barrel root or a barrel's isolated worktree.

#### Scenario: Switching to a registered barrel root
- GIVEN a valid barrel name (e.g. `auth-service`)
- WHEN user invokes `/battery:switch auth-service`
- THEN it navigates the session to the barrel root, updates the Pi trust store, and refreshes the TUI status bar.

#### Scenario: Switching to a barrel's track worktree
- GIVEN a barrel and track ID (e.g. `auth-service/track-auth`)
- WHEN user invokes `/battery:switch auth-service/track-auth`
- THEN it navigates to `<barrel_path>/.worktrees/track-auth` and updates trust.

---

### Requirement: Multi-Barrel Spec Validation Command (`/battery:validate`)
The extension MUST provide `/battery:validate` to audit `.batteryrc` schema, barrel paths connectivity, cross-barrel specs, and spec deltas.

#### Scenario: All barrel paths and specs are valid
- GIVEN accessible barrel paths and valid living specs
- WHEN user invokes `/battery:validate`
- THEN it outputs a green success report confirming workspace and spec health.

#### Scenario: Missing barrel path or broken spec
- GIVEN an inaccessible barrel path or invalid GIVEN/WHEN/THEN scenario
- WHEN user invokes `/battery:validate`
- THEN it outputs the error details with actionable remediation steps.

---

### Requirement: Track Dispatch Command (`/battery:dispatch <track_id>`)
The extension MUST provide `/battery:dispatch` to verify and dispatch track specifications across participating downstream barrels.

#### Scenario: Track dispatched to downstream barrels
- GIVEN a valid multi-barrel track in `.cooper/active/<track_id>`
- WHEN user invokes `/battery:dispatch <track_id>`
- THEN it verifies barrel readiness and reports track synchronization status.
