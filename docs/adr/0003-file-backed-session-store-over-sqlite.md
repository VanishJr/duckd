---
od: OD-8
chosen: One JSON file per session, with temp-file-plus-rename writes.
status: accepted
ratified_by: S1-16
supersedes: null
---

# ADR-0003: File-backed session store over SQLite

- **Status:** Accepted
- **Date:** 2026-08-18
- **Deciders:** the decider role

## Context

`docs/architecture.md` lists "file-backed store vs SQLite" as an open question and says sessions outlive any single process. The format follows from a question underneath it: how many processes may hold one session at the same time.

Nothing writes a session today. `packages/core/src/store.ts` holds the `SessionStore` interface, `InMemorySessionStore` and a `TODO(store)` for the file-backed default, and the `duckd-mcp`, `duckd` and guard binaries all print "not implemented yet" and exit 1. S0-05 is the task that ships a durable store, and it is blocked on this decision.

Two processes are specified to write, and both arrive in Stage 0. S0-10 wires the server's four tools to `FileSessionStore`. S0-12 gives `duckd start` the same engine, with `--ephemeral` selecting the in-memory store, which makes the file store the CLI's default too. S4-03 adds `duckd sessions ... resume` later. The server is therefore not the sole writer from S0-12 onward.

Those two writers use the same directory but are not expected to hold one session at the same time: a terminal session is the developer's own, and a resume is of a session nobody has open. That is an assumption, not a guarantee. Nothing in the tree enforces it.

The writer that would break it is the hook, and nobody has decided on it. S1-02 denies mutating tools during an open session; whether it also records the denial or increments the stuck counter is what S1-16 settles. A hook that writes fires during a session the server has open, milliseconds apart, which is contention for one session.

`SessionStore` is an interface and exists now. S0-06 is to run one conformance suite against every implementation of it; that suite is not written yet.

## Options considered

### One JSON file per session, with temp-file-plus-rename writes.

One file per session under `~/.duckd/sessions/`, written to a temp file and renamed into place so a reader never sees a half-written session. This is what S0-05 ships and what `store.ts` already names in its TODO.

It is sufficient while no two processes hold one session at the same time, and it costs nothing: no dependency, no schema, no migration path to maintain before anything has shown one is needed. Sessions stay readable and hand-editable, which matters while the state shape is still moving.

The cost is that it holds only while the assumption holds. Rename is atomic per write; it is not concurrency control. Two writers that overlap produce a silent lost update, which is the one failure a file store cannot report. The hook is the writer that would produce exactly that, and S1-16 has not decided whether the hook writes.

### SQLite.

A single database file with real concurrent access control: transactions, and in WAL mode a reader that is not blocked by a writer and a writer that fails loudly rather than silently clobbering.

The case for opening on it is that the contention is already specified rather than hypothetical. S0-12 makes the CLI a second writer of the same directory in Stage 0, and the only thing standing between that and a lost update is an expectation about developer behaviour that nothing enforces and no test covers. S1-02 puts a hook in the same session's path in Stage 1. Choosing files means deciding that the assumption holds before anyone has run the two writers together.

The cost of arriving later is not symmetric with the cost of arriving now. Swapping stores after S0-05 means a migration for anyone with sessions on disk, and it means discovering the failure through a developer whose session state was quietly wrong rather than through an error. Node ships `node:sqlite`, so the dependency argument is weaker than it looks, and a schema for a session that is already a typed object is a small, one-time cost paid while the shape is still cheap to change.

The cost accepted by choosing it is a schema and a migration story before any observed failure has justified either, and a store that is harder to inspect than a JSON file while the state shape is still moving.

## Decision

We chose **one JSON file per session, with temp-file-plus-rename writes**, provisionally. This is not the final answer to OD-8.

The choice was selected on cost of reversal, not on expected correctness. We are not claiming the file store is right for the writer count duckd ends up with. We are claiming that being wrong about it is cheap to fix at this point and that being early on SQLite is not refundable. `SessionStore` is an interface and exists now, so replacing the backing store is one more implementation behind a seam that is already there. S0-06 will run the same conformance suite against every implementation, which makes the swap a checked change rather than a rewrite. That suite is not written yet, which is the part of this argument that is currently unpaid.

Against that, opening on SQLite means a dependency and a schema before anything has shown either is needed, and the concurrency it buys is contention that has not happened. The two writers Stage 0 specifies, the server and the CLI, are not expected to hold one session at the same time.

The roadmap's own reasoning is carried over here rather than re-argued: OD-8 is decided twice, S0-00g records the first half, and S1-16 makes the second. With the writer count known rather than guessed, S1-16 either confirms files or specifies what replaces them.

## Consequences

- **Easier:** S0-05 ships with no new dependency and no schema. Sessions stay plain JSON on disk, readable and hand-editable while the state shape is still moving, which helps debugging S0-10 and S0-12. `InMemorySessionStore` stays the test and `--ephemeral` path unchanged.
- **Accepted cost:** correctness now rests on an assumption nobody has written down as a constraint, that no two processes hold one session at the same time. Temp-file-plus-rename makes each write atomic; it is not concurrency control. A developer resuming from the terminal a session an editor still has open produces a lost update with no error, which is the one failure a file store cannot report. Nothing in the tree enforces the assumption and no test covers it.
- **Harder:** if S1-16 decides the hook writes, the format is a consequence rather than a choice and files have to be replaced. That means a second implementation plus a migration for anyone with sessions on disk. The claim that this is cheap depends on S0-06's conformance suite existing, and it does not yet.
- **Revisit if:** S1-16 gives the hook a write, whether to record a denial or to increment the stuck counter. Sooner than that if S0-12 or S1-02 shows the no-overlap assumption does not hold, in which case this is due for revisiting before S1-16 rather than at it.
