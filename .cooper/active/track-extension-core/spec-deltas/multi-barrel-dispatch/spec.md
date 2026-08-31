# Spec Delta: multi-barrel-dispatch

## Requirements

### + Requirement: Multi-Barrel Track Dispatch Verification
The extension MUST verify that participating downstream barrels exist and have their worktrees and `.cooper/` structures initialized before dispatching.

#### + Scenario: Dispatching track with all barrels ready
- GIVEN a multi-barrel track specifying barrels `auth-service` and `web-dashboard`
- WHEN track dispatch is initiated
- THEN it confirms both barrel locations, validates their tech stacks, and reports successful dispatch readiness.
