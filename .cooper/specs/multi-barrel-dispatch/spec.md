# Capability Spec: multi-barrel-dispatch

## Overview
Defines orchestration, verification, and dispatch of multi-barrel track specifications and task plans across participating downstream repositories/packages.

---

## Requirements

### Requirement: Multi-Barrel Track Dispatch Verification
The extension MUST verify that participating downstream barrels exist and have their worktrees and `.cooper/` structures initialized before dispatching.

#### Scenario: Dispatching track with all barrels ready
- GIVEN a multi-barrel track specifying barrels `auth-service` and `web-dashboard`
- WHEN track dispatch is initiated
- THEN it confirms both barrel locations, validates their tech stacks, and reports successful dispatch readiness.

#### Scenario: Dispatching track with missing barrel
- GIVEN a barrel listed in track plan that does not exist on disk
- WHEN track dispatch is initiated
- THEN it halts and reports the missing barrel path with remediation instructions.
