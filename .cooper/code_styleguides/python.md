# Python Style Guide

## General Rules
- Follow PEP 8 guidelines strictly.
- Use explicit type annotations for all function arguments and return values (PEP 484).
- Use `ruff` or `flake8` + `black` for formatting and linting.

## Functions & Error Handling
- Write descriptive docstrings (Google style or Sphinx format).
- Catch specific exceptions rather than bare `except:`.
- Use context managers (`with`) for file and resource handling.

## Testing
- Write tests using `pytest`.
- Maintain test coverage >80%.
- Follow TDD (Red -> Green -> Refactor) before committing production code.
