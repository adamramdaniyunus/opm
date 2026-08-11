# CLAUDE.md

Follow [AGENTS.md](AGENTS.md) for repo conventions (style guide, branch names, commit format, architecture rules). This file adds Claude-specific execution rules.

## Do Not Run Verification Commands Unless Asked

Do **not** run unit tests, lint, typecheck, formatters, or build commands on your own initiative. The user runs these themselves.

This includes, but is not limited to:

- `bun test`, `bun run test`, `vitest`, or any single test file
- `bun typecheck`, `bun run typecheck`, `tsc`
- `bun lint`, `eslint`, `oxlint`, `prettier`, `bun run format`
- `bun turbo <anything>`, `bun run build`, `bun run generate`

Rules:

1. Run one of these **only** when the user explicitly asks in the current turn (e.g. "jalankan test", "run typecheck", "cek lint"). A single explicit request authorizes that one run, not a habit for the rest of the session.
2. When you finish a change, stop at the edit. Do not "verify" by running the suite.
3. Instead of running them, tell the user which command is relevant so they can run it, e.g. "Silakan jalankan `bun typecheck` dari `packages/opencode`."
4. If you believe a change is risky without verification, say so in one sentence and let the user decide. Do not run the command anyway.
5. Report honestly: since nothing was run, describe the change as unverified rather than as passing.

Reading test files, searching them, or writing/editing tests is fine — the restriction is on *executing* these commands.

## Do Not Commit Unless Asked

Do **not** create commits, amend commits, or push on your own initiative. Leave finished work in the working tree and let the user review it first.

This includes: `git commit` (including `--amend`), `git push`, `git merge`, `git rebase`, `git reset --hard`, `git checkout`/`git switch` to another branch, `git stash`, and `gh pr create`.

Rules:

1. Commit or push **only** when the user explicitly asks in the current turn (e.g. "commit ini", "push ke branch X"). That authorizes that one action, not every later change in the session.
2. Never chain an unasked commit onto an edit task. Finishing the code is the deliverable; committing is a separate request.
3. After editing, summarize what changed and which files are affected so the user can review and commit themselves.
4. Read-only git commands are always fine: `git status`, `git diff`, `git log`, `git show`, `git branch --list`.
5. When a commit *is* requested, follow the AGENTS.md conventions: `type(scope): summary`, and branch from `dev` rather than committing onto it directly.

## When You Are Asked To Run Them

- Tests cannot run from the repo root (guard: `do-not-run-tests-from-root`). Run from a package directory such as `packages/opencode`.
- Use `bun typecheck` from a package directory, never `tsc` directly.
