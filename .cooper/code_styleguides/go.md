# Go Style Guide

## General Rules
- Adhere to standard Go conventions (`Effective Go` and `go fmt`).
- Always check and handle errors explicitly; never ignore returned errors (`_`).
- Keep packages small, focused, and cohesive.

## Testing & Quality
- Write tests using the standard `testing` package or `testify`.
- Name test functions `Test<FunctionName>_<Scenario>`.
- Maintain test coverage >80%.
