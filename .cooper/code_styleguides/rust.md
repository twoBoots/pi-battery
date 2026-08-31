# Rust Style Guide

## General Rules
- Follow standard Rust naming conventions (`rustfmt` and `clippy`).
- Avoid `unwrap()` and `expect()` in production paths; propagate errors with `?` or handle them explicitly.
- Prefer explicit error enums using `thiserror` or `anyhow` as appropriate.

## Testing & Quality
- Include unit tests in a `tests` module in the same file or under `tests/`.
- Maintain test coverage >80%.
- Follow TDD (Red -> Green -> Refactor) before committing production code.
