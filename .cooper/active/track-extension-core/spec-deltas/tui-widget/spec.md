# Spec Delta: tui-widget

## Requirements

### + Requirement: Real-Time Terminal UI Status Bar
The extension MUST inject a persistent status bar component into Pi's terminal session.

#### + Scenario: Displaying multi-barrel status
- GIVEN a battery workspace with 3 barrels and active track `auth-flow-v2`
- WHEN the status widget renders
- THEN it formats a concise status line (e.g. `[Battery: multi-repo (3 barrels)] [Track: auth-flow-v2] [Barrels: 2/3 synced]`).
