# AGENTS.md

## Project Context

This repository is a Git-aware database safety project called VajraDB. The project is designed to model a workflow where database schema changes are validated before they can pass through a protected pipeline.

The goal is to prevent dangerous SQL operations from reaching production by enforcing policy checks, requiring signatures for approved changes, and blocking unsafe migrations.

## Core Mission

When working on this repository, prioritize the following principles:

1. Keep the project aligned with VajraDB as a database safety and migration enforcement system.
2. Treat the project as a workflow-based Git tool, not only as a UI mockup.
3. Preserve the idea that protection happens in the Git/terminal workflow as well as in the interface.
4. Design changes around policy validation, migration safety, and secure approval flows.

## Repository Expectations

- Use terminal-friendly workflows and Git-aware design.
- Keep the dashboard useful as a visual representation, but do not treat the UI as the only source of enforcement.
- Favor secure, deterministic, policy-driven behavior over purely cosmetic changes.
- Document new features in README.md and IMPLEMENTATION.md when they materially change the project direction.

## Suggested Standards

- Keep changes modular and easy to reason about.
- Prefer clear naming for policy, validation, signature, and migration logic.
- Do not add fake backend logic that suggests real production enforcement when no validation layer exists.
- If a feature is intended for Git hooks, CI checks, or command-line validation, document it clearly.

## Agent Behavior Rules

When making changes:

- maintain the conceptual model of VajraDB as a safety layer
- avoid drifting into unrelated UI-only features unless explicitly requested
- ensure that any workflow or validation change is consistent with Git-based operations
- keep the repo realistic for a database safety product rather than a generic dashboard

## Summary

This project is not just a mockup. It represents a Git-aware database protection workflow where migration safety is checked, signed, and enforced before changes can pass through a protected environment.
