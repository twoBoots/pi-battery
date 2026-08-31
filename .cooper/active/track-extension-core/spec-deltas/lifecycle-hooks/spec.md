# Spec Delta: lifecycle-hooks

## Requirements

### + Requirement: Pre-Commit & Pre-Tool SDD Interceptor
The extension MUST enforce living spec deltas and cross-barrel contracts before staging or committing file modifications.

#### + Scenario: File mutation intercepted
- GIVEN a file modification tool call (`write_to_file`, `replace_file_content`)
- WHEN the tool is about to execute
- THEN the interceptor validates that living spec deltas exist for the target barrel or active track.
