# Implementation Plan for VajraDB

## 1. Vision

VajraDB is a database governance and migration safety system designed to stop dangerous schema changes before they are accepted into a protected workflow. The system is built around three principles:

- detect unsafe SQL operations early
- verify approved changes cryptographically
- block anything that violates policy

## 2. Problem Statement

Database schema changes are high-risk operations. If a developer runs destructive commands such as DROP TABLE, TRUNCATE, or unsafe ALTER statements without proper validation, the result may be data loss, downtime, or security violations. Most teams rely on manual review, which is inconsistent and error-prone.

VajraDB addresses this by adding a structured validation layer into the Git and migration lifecycle.

## 3. Core Architecture

### A. Policy Layer
A configuration file such as vajra.toml stores production rules. These rules define what is allowed and blocked.

Example:

```toml
[policy.production]
allow_drop_column = false
allow_truncate = false
require_lock_timeout = "5s"
signature = "ed25519_required"
```

### B. SQL Analyzer
A parser or syntax-aware checker inspects statements before they are executed. It identifies command types and extracts operation intent.

Examples of dangerous patterns:

- DROP TABLE
- ALTER TABLE DROP COLUMN
- TRUNCATE TABLE
- destructive schema rewrite commands

### C. Policy Evaluator
The analyzer compares the detected operation with configured rules. If the command violates policy, the workflow is rejected immediately.

### D. Signature Layer
Approved changes are signed using Ed25519. This ensures that only trusted changes pass through the protected workflow.

### E. Git Hook / Terminal Gate
The project should be integrated into Git lifecycle checks, especially:

- pre-commit
- pre-push
- CI validation

This allows the validation to happen in the terminal and Git workflow itself, not only in the UI.

## 4. Suggested Workflow

1. Developer creates a migration script.
2. Git hook triggers VajraDB validation before commit or push.
3. Validator reads the SQL and converts it to a parsed operation model.
4. Policy rules are evaluated.
5. If safe, the change is signed with Ed25519.
6. If unsafe, the command exits with a failure and blocks the push.

## 5. Data Model

A simple internal model can be used:

```text
MigrationRequest
- id
- author
- branch
- file_path
- sql_text
- timestamp
- signature
- status
```

```text
ValidationResult
- allowed: boolean
- violations: [string]
- warning_level: low | medium | high
- signature_required: boolean
```

## 6. Terminal Integration

The project should support terminal invocation such as:

```bash
vajra check migration.sql
vajra sign migration.sql
vajra verify migration.sql
```

This makes the tool usable in terminal-based Git workflows, which matches the project objective.

## 7. Frontend Role

The UI dashboard should be treated as a viewing and reporting layer. It can display:

- blocked changes
- approved changes
- policy violations
- safety status summaries
- audit records

The actual enforcement should happen in the terminal and Git layer, because that is where safe workflow enforcement is strongest.

## 8. Minimal MVP

The minimum useful working version should implement:

- SQL file reading
- keyword detection for unsafe commands
- basic policy configuration
- terminal rejection output
- signed change handling using Ed25519

## 9. Future Enhancements

- AST-based SQL semantic analysis
- multi-environment policy support
- migration history dashboards
- support for PostgreSQL/MySQL/SQLite rules
- audit log storage
- Terraform or schema diff integration

## 10. Summary

VajraDB is designed as a practical security layer for database migration workflows. The implementation should prioritize Git-aware validation and terminal enforcement so that unsafe database changes are identified and blocked before they reach production.

The UI acts as a dashboard layer; the real protection should live in the validation pipeline and Git workflow.
