# Claude Code plugin bundle

A ready-to-install duckd bundle for Claude Code: the skill, the guard hooks, and the
MCP server config in one plugin.

## Install

```bash
claude plugin install ./examples/claude-code
```

Then start any message with `@duck`.

## What's in here

| Path | Source | |
|------|--------|--|
| `.claude-plugin/plugin.json` | hand-written | plugin manifest |
| `.mcp.json` | hand-written | points Claude Code at the `duckd-mcp` server |
| `hooks/hooks.json` | hand-written | wires `PreToolUse` and `Stop` to `@duckd/hooks` |
| `skills/rubber-duck/SKILL.md` | **generated** | emitted by `@duckd/adapters` from the spec |

The generated file is not committed yet, because `@duckd/adapters` is unimplemented. Once it
lands, produce it with:

```bash
pnpm duckd adapters --target claude-code --out examples/claude-code
```

Do not hand-edit anything marked generated. Change
[`docs/spec/socratic-protocol.md`](../../docs/spec/socratic-protocol.md) and regenerate.
The `spec-drift` CI job exists to catch the alternative.

## Why the hooks ship with the skill

The skill tells the model to withhold the fix; the hooks make it so. Installing the
skill alone gives you a duck that is usually Socratic. Installing the bundle gives you
one that cannot apply the fix for you even when it wants to. See
[`packages/hooks`](../../packages/hooks/README.md).
