---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git commit:*)
argument-hint: "[files...]"
description: Create atomic commit with conventional prefix
---

## Context

- Status: !`git status --porcelain`
- Staged changes: !`git diff --cached --stat`
- Unstaged changes: !`git diff --stat`

## Task

Create an atomic commit for changes.

Files to include: $ARGUMENTS (if empty, include all relevant changes)

1. Stage files with `git add`
2. Write commit message:
   - Conventional prefix: feat|fix|docs|refactor|test|chore
   - Concise "why" not "what"
   - No emoji, no AI attribution
3. Commit with `git commit -m "..."`
