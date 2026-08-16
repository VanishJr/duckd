# @duckd/adapters

Generates every host-specific artifact from
[`docs/spec/socratic-protocol.md`](../../docs/spec/socratic-protocol.md).

## Targets

| Target | Emits |
|--------|-------|
| `agents-md` | `AGENTS.md` — read by Codex, Cursor, Junie, Copilot |
| `claude-code` | `skills/rubber-duck/SKILL.md` + plugin manifest |
| `cursor` | `.cursor/rules/*.mdc` |
| `copilot` | `.github/skills/` |
| `junie` | `.junie/guidelines.md` |

## Why generate instead of hand-write

Five hosts, one behaviour. Written by hand, they drift — and a drifted duck gives up
the answer in one editor while withholding it in another, which quietly destroys the
only property the tool has. Generation makes the spec the single place a behaviour
change can happen, and CI fails the build when an artifact no longer matches it.

Every generated file starts with a provenance header naming the spec revision it came from.
