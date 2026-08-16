# @duckd/core

The engine. Owns the behaviour described in
[`docs/spec/socratic-protocol.md`](../../docs/spec/socratic-protocol.md) and nothing else.

## Responsibilities

| Module | Owns |
|--------|------|
| `phases.ts` | The LOCATE → UNDERSTAND → SOLVE state machine, including legal regression |
| `session.ts` | Session and turn shape, including the duck's *private* hypotheses |
| `store.ts` | `SessionStore` interface + in-memory implementation |
| `provider.ts` | `LlmProvider` interface + a scripted provider for tests |
| `hints.ts` | The bounded hint ladder (Strict Rule 5) |

## Boundaries

- **No transport.** No MCP, no HTTP, no stdio, no CLI parsing. Those live in `@duckd/mcp` and `@duckd/cli`.
- **No vendor SDKs.** Every model call goes through `LlmProvider`, so the engine runs in tests with no network.
- **No filesystem.** Reading git or source is `@duckd/code-context`'s job; `core` receives context, it does not fetch it.

These boundaries are what let `@duckd/evals` run the engine thousands of times deterministically.
