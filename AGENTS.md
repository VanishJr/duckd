# AGENTS.md

Instructions for AI coding agents working in this repository. These are the
rules agents break by default. Read them before changing anything.

## What this is

`duckd` is a Socratic debugging engine for AI coding agents. It guides a
developer to find a bug themselves by asking one question at a time and never
handing over the fix. It is moving from a markdown-only skill to a real engine
with an MCP server, a CLI and per-host adapters.

## Source of truth

`docs/spec/socratic-protocol.md` defines the behaviour: the three phases
(LOCATE, UNDERSTAND, SOLVE), their closing conditions, backward phase
regression, the off-ramp, and hint escalation after 2 stuck exchanges.

Any change to how the duck behaves goes into that file first, then into code.
Never change behaviour in code and leave the spec describing something else.
If code and spec disagree, the spec is right and the code is a bug.

## Architecture rules

Dependencies point inward at `core`:

```
core <- adapters <- cli
core <- mcp <- code-context
core <- hooks
core <- evals
```

`core` must not know about MCP, transports, Claude Code, the filesystem or any
specific host. It takes an event plus session state and returns the next
question plus new state. Everything else is an adapter around it.

This is enforced by TypeScript project references, not by convention. Adding an
import that points outward from `core` is a build error, not a review comment.
Do not "fix" such an error by adding a reference in the other direction. If a
change seems to require it, stop and say so instead.

## Generated artifacts

Host-specific files are generated from the spec, never written by hand. That
includes `examples/claude-code/skills/rubber-duck/SKILL.md` and every adapter
output under `packages/adapters`.

If a generated file is missing because its generator does not exist yet, leave
it missing and document the gap. Do not hand-write a stand-in. Drift between
hosts is the central risk this project exists to prevent, and a hand-written
copy is exactly that drift.

## Toolchain

pnpm 11.22, Node 24 (see `.nvmrc`), TypeScript 7.0, Vitest 4.1, Biome 2.5,
MCP SDK 1.30, zod 4, commander 15.

Versions live in the `catalog:` block of `pnpm-workspace.yaml`. Bump a version
there, never in an individual `package.json`. Adding a dependency means adding
it to the catalog first.

`tsconfig.base.json` sets `"types": ["node"]` explicitly. This is required:
pnpm's isolated `node_modules` breaks TypeScript's automatic type discovery
under TS 7. `@types/node` is pinned to `^24` to match the runtime. Do not
upgrade it to `^26`.

## Gate

Before opening a pull request, all three must pass:

```bash
pnpm biome check .
pnpm tsc -b
pnpm vitest run
```

A pull request is not opened while any of them fails. Do not disable a rule,
skip a test or add a `// @ts-expect-error` to make the gate pass. If the gate
is wrong, fix the gate deliberately and say why.

## Commits

```
type(scope): subject
```

- **type**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`
- **scope**: `core`, `mcp`, `cli`, `code-context`, `hooks`, `adapters`,
  `evals`, `docs`, `repo`
- **subject**: imperative mood, lowercase, no trailing period, max 60 characters

Example: `feat(core): add regression transition to phase machine`

One logical change per commit. Do not bundle unrelated edits.

## Pull requests

Fill in `.github/pull_request_template.md` honestly. An unchecked gate box is
more useful than a checked one that is not true.

## Known traps

- The `spec-drift` CI job is gated with `if: false`. It calls
  `duckd adapters --check`, which does not exist yet. Flip the flag when
  `@duckd/adapters` ships, not before. A job that always fails teaches people
  to ignore CI.
- Several packages currently contain only contracts and TODOs naming their
  owner. That is intentional. Do not fill them in opportunistically while
  working on something else.
- `examples/claude-code` is not installable yet. Its README documents what is
  missing.

## Writing style

Applies to code comments, documentation, commit messages and PR descriptions.

- Never use em dashes.
- No marketing language, no motivational filler.
- Prefer a claim that can be defended over one that sounds impressive.
- State limitations plainly. "Not implemented yet" is a complete sentence.