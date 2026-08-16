# ADR-0001 — TypeScript monorepo on pnpm workspaces

- **Status:** Accepted
- **Date:** 2026-08-16
- **Deciders:** VanishJr

## Context

duckd ships more than one artifact from one behaviour:

- an MCP server (stdio and streamable HTTP),
- a CLI,
- Claude Code hook binaries,
- a generator that emits `AGENTS.md`, `.cursor/rules`, `.github/skills` and a Junie
  guidelines file,
- an eval harness.

All five depend on the same domain model — phases, sessions, the hint ladder — and all
five are only correct insofar as they agree with `docs/spec/socratic-protocol.md`. The
failure mode that matters is *drift*: a duck that withholds the fix in Cursor and hands
it over in Copilot has lost the only property it has.

Two constraints shape the choice. The hosts are JavaScript-native — the MCP SDK, Claude
Code hooks and every editor integration expect a Node process — so the runtime is not
really open. And the packages are versioned together, because a phase-machine change in
`core` has to reach the hooks and the adapters in the same commit or the guards start
enforcing yesterday's rules.

## Options considered

### Option A — one package

A single `duckd` package with subpath exports.

Simplest possible setup, no workspace tooling, one `package.json`. But nothing prevents
the CLI from importing the MCP transport, or `core` from reaching for `child_process` to
shell out to git. The boundary that keeps `core` free of transport and vendor SDKs — the
boundary that makes deterministic evals possible — would exist only in review comments.

### Option B — pnpm workspaces + TypeScript project references

Seven packages, `workspace:*` links, `tsc -b` ordering the build from the reference graph.

Costs a root config layer and makes `tsc -b` mandatory rather than optional. In exchange,
the dependency graph is declared and mechanically enforced: `core` cannot import `mcp`
because it does not depend on it, and the build fails rather than the design eroding.
pnpm's non-flat `node_modules` closes the other hole — a package cannot use a dependency
it did not declare, so undeclared coupling surfaces at install time.

### Option C — polyrepo

One repository per deliverable, published to npm, consumed by version range.

Real isolation, and independent release cadence. But every `core` change becomes publish,
bump, install across five repos — and during that window the hooks enforce a different
protocol version than the adapters generate. That is the exact drift this project is
built to prevent, reintroduced at the infrastructure layer. Polyrepo answers a problem
we do not have (independent teams, independent cadence) and worsens the one we do.

### Option D — a non-JS runtime (Go, Rust) for the engine

Better single-binary distribution for the CLI and the hooks.

Rejected on integration cost, not on merit. The MCP SDK, the hook contract and every
editor extension point are JavaScript-first; a second language buys a nicer binary and
pays for it with an FFI seam through the middle of the domain model, plus a second
toolchain in CI for a project whose hot path is a network call to a model.

## Decision

We chose **Option B — pnpm workspaces with TypeScript project references**.

The deciding factor is that it is the only option where the architectural boundary is
also a build error. Drift between hosts is this project's central risk; a layout in which
`core` *cannot* depend on a transport, and in which every artifact is regenerated from one
spec inside one commit, addresses that risk structurally instead of by discipline.

Concretely: seven packages under `packages/*`, `composite: true` everywhere, a solution-style
root `tsconfig.json` holding the reference graph, and versions moving together at `0.0.0`
until there is something worth publishing.

## Consequences

- **Easier:** cross-package refactors are one commit and one `tsc -b`; `core` stays
  network-free and therefore eval-friendly; the adapter drift check can run in CI because
  spec and adapters are in the same tree.
- **Harder:** contributors need pnpm and corepack, not just npm. Adding a package means
  touching three files (`package.json`, `tsconfig.json`, the root references array) — a
  small tax that is also what keeps the graph honest.
- **Accepted cost:** all packages share a version. Publishing `@duckd/core` on its own
  cadence would need a release tool (changesets); that is deferred until anything is
  published at all.
- **Revisit if:** a non-Node host becomes a primary target, or `core` stabilises enough
  that independent versioning is worth the release machinery.
