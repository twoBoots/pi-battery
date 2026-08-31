# TypeScript Style Guide

## General Rules
- Prefer `const` over `let`. Never use `var`.
- Enforce strict typing (`strict: true` in `tsconfig.json`). Avoid `any`; use `unknown` with type guards if the type is truly dynamic.
- Prefer explicit interface definitions and named exports.

## Functions & Async
- Always declare return types on exported functions.
- Use `async`/`await` instead of raw Promise chains (`.then()`).
- Handle errors gracefully with try/catch blocks and meaningful error types.

## Testing
- Follow Test-Driven Development (TDD): Red -> Green -> Refactor.
- Group unit tests using `describe` blocks and clearly describe test scenarios with `it('should ...')`.
