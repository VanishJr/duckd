# Architecture

## The one-sentence version

`docs/spec/socratic-protocol.md` defines the behaviour, `@duckd/core` implements it,
everything else is a transport or a translation.

## Package graph

```
                        ┌──────────────┐
                        │ docs/spec/   │  socratic-protocol.md
                        │              │  (normative behaviour)
                        └──────┬───────┘
                               │ parsed by
                               ▼
        ┌──────────────────────────────────────────────┐
        │                @duckd/adapters               │──► AGENTS.md
        │        spec ──► host-specific artifacts      │──► .cursor/rules
        └──────────────────────┬───────────────────────┘──► .github/skills
                               │                        └─► .junie/guidelines.md
                               ▼
   ┌────────────┐      ┌──────────────┐      ┌──────────────────┐
   │ @duckd/mcp │─────►│ @duckd/core  │◄─────│ @duckd/hooks     │
   │ stdio/HTTP │      │ state machine│      │ PreToolUse, Stop │
   └────────────┘      │ sessions     │      └──────────────────┘
                       │ providers    │
   ┌────────────┐      │ hint ladder  │      ┌──────────────────┐
   │ @duckd/cli │─────►│              │◄─────│ @duckd/evals     │
   └─────┬──────┘      └──────▲───────┘      └──────────────────┘
         │                    │
         └───────────►┌───────┴──────────┐
                      │@duckd/code-context│  git, tree-sitter, later LSP
                      └───────────────────┘
```

Dependencies point inward. `core` depends on nothing in the workspace, which is the
property the whole layout exists to protect.

## The three rules

**1. `core` has no I/O.**
No transport, no filesystem, no vendor SDK. Every model call goes through `LlmProvider`;
every repository read goes through `@duckd/code-context` and arrives as an argument. This
is what lets `@duckd/evals` run the engine thousands of times with a `ScriptedProvider`
and no network. An engine that can't be evaluated cheaply won't be evaluated at all.

**2. The spec is upstream of every artifact.**
Five hosts want the same behaviour in five dialects. Written by hand they drift, and a
duck that withholds the fix in Cursor but hands it over in Copilot has lost the only
property it has. So `@duckd/adapters` parses the spec and generates all of them, each with
a provenance header naming the spec revision. CI fails when an artifact goes stale.

**3. The Prime Directive is enforced, not requested.**
A prompt saying "never write the fix" is a request the model honours *most* of the time,
and the one session it slips is the session where the developer learns nothing. So the
constraint is also mechanical: `@duckd/hooks` denies `Edit`/`Write` while a session is
open, and the `Stop` guard rejects a turn with no phase tag or more than one question.
Prompt and hook enforce the same rule from two directions; both are generated from the
same spec.

## Session lifecycle

```
  problem statement
        │
        ▼
  Preparation ──► private competing hypotheses (never rendered)
        │
        ▼
  ┌── LOCATE ──────► UNDERSTAND ──────► SOLVE ──► verify empirically ──► done
  │      ▲                ▲               │
  │      └────────────────┴───────────────┘
  │        regression on contradicting evidence
  │
  └── stuck 2+ exchanges ──► hint ladder (bounded; no rung reveals the fix)
```

Forward transitions move one phase at a time and only when the current phase's exit
condition is met. Backward transitions may skip: evidence found in SOLVE can invalidate
the location outright and send the session back to LOCATE. The off-ramp is the only exit
that bypasses all of this, and only the developer can take it.

## Where state lives

Sessions outlive any single process: the MCP server answers a question, a hook consults
the same session milliseconds later, and the CLI resumes it tomorrow. `SessionStore` is
therefore an interface, defaulting to file-backed storage under `~/.duckd/sessions/`,
with the in-memory implementation reserved for tests and `--ephemeral` runs.

## Open questions

Tracked as ADRs in [`docs/adr/`](./adr/) as they are decided:

- File-backed store vs SQLite, once concurrent hook and server access is real.
- Whether `@duckd/core` is published independently, which requires a release tool.

Who runs the model is no longer one of them.
[ADR-0002](./adr/0002-llm-provider-not-mcp-sampling.md) settles it: model access goes
through `LlmProvider`, which owns its own credentials, and host-delegated MCP sampling is
rejected. Sampling is deprecated as of MCP revision 2026-07-28 and Claude Code does not
implement it.
