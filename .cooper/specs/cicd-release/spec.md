# Capability Spec: cicd-release

## Overview
Defines continuous integration quality gatekeeping and automated GitHub release packaging for `pi-battery`.

---

## Requirements

### Requirement: Continuous Integration Validation Workflow
The repository MUST include a GitHub Actions workflow that executes linting, typechecking, build verification, and test coverage on all pull requests and pushes to `main`.

#### Scenario: Pull request triggers CI workflow
- GIVEN a pull request targeting branch `main`
- WHEN the workflow triggers on GitHub Actions
- THEN it executes on `ubuntu-latest` with Node.js LTS and runs `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run test:coverage`.

#### Scenario: CI workflow fails on test or typecheck failure
- GIVEN a pull request containing failing tests or TypeScript compiler errors
- WHEN CI workflow executes
- THEN the job fails with non-zero exit code, blocking pull request merge.

---

### Requirement: Automated GitHub Release Packaging
The repository MUST include a GitHub Actions workflow that packages built assets and creates GitHub Releases upon version tag pushes.

#### Scenario: Version tag push triggers release workflow
- GIVEN a Git tag matching `v*.*.*` is pushed to remote
- WHEN release workflow triggers
- THEN it verifies tests, creates a compiled distribution bundle `pi-battery-dist.tar.gz`, and creates a GitHub Release with release notes and bundle asset attached.

#### Scenario: Manual workflow dispatch triggers release
- GIVEN an authorized maintainer runs the release workflow via GitHub Actions manual dispatch
- WHEN the workflow completes successfully
- THEN a GitHub Release is published with generated release notes.
