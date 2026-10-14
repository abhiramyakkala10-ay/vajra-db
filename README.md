# VajraDB

VajraDB is a Git-aware database safety and policy enforcement project designed to stop dangerous schema changes before they reach production. The project combines a browser dashboard, Git hook workflow awareness, migration policy checks, and cryptographic attestation designed to protect database integrity.

## Project Goal

The primary objective of VajraDB is to act as a safety layer for database schema changes. It is meant to:

- scan incoming SQL or migration definitions
- detect unsafe operations such as DROP, TRUNCATE, and unsafe ALTER statements
- enforce policy rules configured in a manifest file such as vajra.toml
- require approval using cryptographic signatures
- reject unsafe changes before they pass the protected workflow

This is a workflow-first project intended to work with Git-based development rather than as a standalone UI-only mockup.

## Core Capabilities

### 1. Instant Safety Checks
VajraDB analyzes proposed SQL or migration changes in near real time and compares them against a policy model. It can identify dangerous operations before they reach a protected environment.

### 2. Policy Enforcement
The project supports policy files that describe allowed and disallowed database actions. Examples include:

- allow_drop_column = false
- allow_truncate = false
- require_lock_timeout = "5s"

### 3. Cryptographic Attestation
Approved changes can be signed with Ed25519 keys so their origin and integrity can be verified. This helps ensure that a change was not altered after approval.

### 4. Hard-Stop Gate
If a migration violates policy or fails validation, VajraDB stops it before it continues through the workflow. This protects production data from accidental or malicious schema change operations.

## Example Policy

```toml
[policy.production]
allow_drop_column = false
allow_truncate = false
require_lock_timeout = "5s"
signature = "ed25519_required"
```

## Git-Centric Workflow

This project is designed to fit into a Git-driven development process.

Typical flow:

1. A developer creates or modifies a database migration.
2. A Git hook or local validation step triggers safety checks.
3. VajraDB parses the SQL and evaluates it against policy.
4. If the migration is valid, it can be signed and committed.
5. If it is unsafe, the workflow stops and rejects the change.

This means the project is meant to be used through terminal and Git workflow tooling, not just as a UI dashboard.

## Project Structure

```text
.
├── README.md
├── IMPLEMENTATION.md
├── AGENTS.md
├── package.json
├── vite.config.js
├── index.html
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
└── dist/
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Intended Future Implementation

The long-term goal is to evolve the project from a frontend concept into a Git-aware validation engine with:

- SQL parsing and migration analysis
- security policy evaluation
- hash or signature verification
- Git pre-commit or pre-push prevention
- optional database gateway enforcement

## Why This Project Matters

The goal of VajraDB is to make schema validation part of the software delivery process. Instead of relying only on human memory or manual review, the system can enforce structural safety as part of the workflow.

This reduces risk, promotes accountability, and helps protect production environments from preventable database failures.

## Summary

VajraDB is a database safety project that enforces rules before risky migration commands can pass. It combines policy checks, cryptographic verification, and a hard-stop enforcement model to protect the integrity of live systems.

The product is designed to work with Git-based development workflows and terminal execution, which makes it a practical safety layer for modern engineering teams.
