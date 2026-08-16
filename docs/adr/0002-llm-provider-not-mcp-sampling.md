# ADR-0002: model access through `LlmProvider`, not MCP sampling

- **Status:** Accepted
- **Date:** 2026-08-16
- **Deciders:** VanishJr

## Context

The engine needs a model. Judging whether a phase's exit condition is met, deciding
advance or regress from a transcript, and phrasing the next single question are all model
calls. Something has to run them, and the choice is between duckd running the model itself
and duckd asking the surrounding agent to run it on its behalf.

`docs/architecture.md` already fixes half of the answer: `core` has no I/O, so whatever
runs the model is reached through an interface. What remained open is who stands behind
that interface, and that part is settled by two external facts rather than by taste.

**MCP `sampling` is deprecated as of spec revision 2026-07-28 (SEP-2577).** Sampling was
the protocol mechanism by which a server asks its host to run a model for it. It is no
longer a mechanism to build on.

**Claude Code does not implement sampling.** It is the primary target host, so the
capability is absent exactly where duckd needs it most. Claude Code does implement
`elicitation` in the CLI, which is a different thing, see the closing section.

Neither fact is a preference. Even if host-delegated sampling were the better design,
there is no supported path to it on the host that matters most.

## Options considered

### Option A: host-delegated sampling

The MCP server asks the host agent to run each completion through
`sampling/createMessage`. duckd ships no credentials, the user pays nothing beyond what
they already pay for their agent, and the duck speaks with whatever model the host is
already running.

This is the option with the better distribution story, and it is unavailable. It is
deprecated in the protocol and unimplemented on the primary host. Choosing it means
putting the engine's hot path on a mechanism that is going away in general and missing in
particular.

### Option B: `LlmProvider` owns its credentials

`core` depends on the `LlmProvider` interface. A concrete provider holds its own API key
or its own endpoint, and `core` neither knows nor cares which. This is the shape the code
already has, including `ScriptedProvider` for tests and evals.

The cost is that duckd needs model access of its own, which the user has to provide.

### Option C: a host-delegated provider behind the same interface

Not an either/or with Option B. Should some client ship a supported way for a server to
borrow the host's model, that becomes one more implementation of `LlmProvider`, and
nothing in `core` changes to accommodate it.

This is deferred, not forbidden, and it is part of why the seam is an interface in the
first place. The decision below is about which implementation ships now, not about what
the engine is permitted to talk to.

## Decision

We chose **Option B**, with **Option C** left open as a later implementation.

`@duckd/core` never calls a model directly. All model access goes through the
`LlmProvider` interface, and the provider owns its own credentials. Host-delegated
sampling is rejected as a mechanism duckd depends on.

## Consequences

- **Accepted cost, stated plainly:** the user must supply an Anthropic API key or run a
  local model through Ollama. duckd cannot ride on the host agent's existing model access.
  A developer already paying for Claude Code pays a second time to run the duck inside it.
- **Harder:** this is a distribution constraint, not a footnote. "Install the plugin" is
  not a complete install story. Onboarding acquires a credential step, the examples and
  the generated adapter output have to explain it, and that friction is paid by every user
  before the duck asks its first question. It is the most likely reason someone tries
  duckd once and does not come back.
- **Easier:** behaviour is identical on every host, because it no longer depends on host
  capability negotiation. `@duckd/evals` can run the engine thousands of times against
  `ScriptedProvider` with no network at all. A local Ollama model is a real path for
  anyone unwilling to add an API key.
- **Revisit if:** a primary host ships a supported, non-deprecated way for a server to use
  the host's model. Option C is then an implementation task, not a redesign.

## Not decided here: elicitation

`elicitation` is available in Claude Code's CLI, and it is the mechanism duckd uses to ask
the developer for structured input, with a plain-text prompt as the fallback for clients
that do not implement it.

That is a separate concern from who runs the model. Elicitation moves a question to the
human; sampling moves a completion to the host. This ADR rejects the second and says
nothing against the first.
