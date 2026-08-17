# Roadmap

What gets built and in what order. How the system is shaped is
[`docs/architecture.md`](./docs/architecture.md); what the duck does is
[`docs/spec/socratic-protocol.md`](./docs/spec/socratic-protocol.md).

## How to read this

- Task IDs are stable. A task that is dropped is struck through, not renumbered.
- Sizes are estimated in working sessions, never in calendar time.
  **(S)** is under a session, **(M)** is about a session, **(L)** is a full
  demanding session. Anything larger is split.
- `depends: S0-03` blocks the task on another task. `depends: OD-5` blocks it on
  an open decision, which means the decision has to be made and written down
  before the code can be written.
- Every `TODO(` marker in the tree maps to a task. The mapping is at the bottom.

Starting point: `@duckd/core` has the phase machine (legal transitions, legal
entry), the session and turn types, `SessionStore` with an in-memory
implementation, `LlmProvider` with `ScriptedProvider`, and the hint ladder as
data. Seven tests pass. Everything else is a contract with a TODO in it.

---

## Stage 0: usable core

**Goal.** One working Socratic loop, end to end, good enough that I debug my own
real bugs with it in Claude Code instead of asking the agent directly.

**Definition of Done.**

- `@duck <problem>` in Claude Code opens a session; every following turn returns
  exactly one phase-tagged question until the developer verifies a fix.
- Phase transitions are decided by a provider judgement over the transcript, and
  an illegal transition cannot be written to a session.
- A session survives a Claude Code restart and resumes from disk by id.
- The off-ramp works: a deliberate request produces the direct answer with the
  trade-off named first, and the session records that it happened.
- A missing or invalid API key produces one actionable sentence, not a stack
  trace, and the credential step is documented before the install step.
- Seven consecutive days of real use, at least five real bugs taken through the
  full loop, logged.

**Kill criteria.**

- After a week I reach for the plain agent instead, and can say why in a sentence
  that is not "it needs more polish".
- The duck leaks the fix in most sessions despite both the prompt and the state
  machine, meaning prompt-level constraint is not enough and Stage 1 enforcement
  is load-bearing rather than belt-and-braces. Reorder, do not continue.
- Cost per session is high enough that I would not pay it myself. Measure it,
  write the number down, decide against the number.

**Tasks.**

- [ ] S0-00a (M) Decide OD-3, who authors the text the developer reads, and
      write it into the spec or an ADR.
- [ ] S0-00b (S) Decide OD-2, Session.phase against Turn.phase. ADR.
- [ ] S0-00c (M) Decide OD-6, one provider call per turn or several. ADR.
- [ ] S0-00d (M) Decide OD-4 and ratify the hint ladder into the spec.
- [ ] S0-01 (M) Prompt set as pure string builders in `core`: exit-condition
      judge, stuck judge, question generator. No I/O, no vendor types.
      depends: S0-00a, S0-00c
- [ ] S0-02 (L) `advance(session, developerTurn, provider)`: run the judge, apply
      the transition through `isLegalTransition`, update `stuckExchanges` and
      `hintLevel`, return the next duck turn plus the new session.
      depends: S0-01, S0-00b, S0-00d
- [ ] S0-03 (S) Transition tests against `ScriptedProvider`: advance, stay,
      regress across two phases, and a rejected illegal transition.
      depends: S0-02
- [ ] S0-04 (M) Off-ramp in `advance`: detect the deliberate request, set
      `offRampTaken`, emit the answer with the trade-off sentence. Decide what
      `resolution` becomes, since `abandoned` currently conflates a chosen
      off-ramp with giving up. depends: S0-02
- [ ] S0-05 (M) `FileSessionStore` under `~/.duckd/sessions/`: one JSON file per
      session, temp-file-plus-rename writes.
- [ ] S0-06 (S) Store conformance suite, run against both implementations so the
      in-memory store cannot drift from the file-backed one. depends: S0-05
- [ ] S0-07 (M) `AnthropicProvider`: credentials of its own, retry on transient
      failures, errors mapped to one actionable message.
- [ ] S0-08 (S) Credential resolution: env var, then `~/.duckd/config.json`,
      precedence documented. Startup fails clean and names the fix.
      depends: S0-07
- [ ] S0-09 (M) zod schemas for the four MCP tools, exported so the CLI validates
      the same shapes.
- [ ] S0-10 (L) `createDuckServer(options)`: the four tools wired to `core` and
      `FileSessionStore`. depends: S0-02, S0-05, S0-09
- [ ] S0-11 (M) `duckd-mcp` bin: `--transport stdio`, `--session-dir`, clean
      shutdown on SIGTERM. depends: S0-10
- [ ] S0-12 (M) `duckd start` on commander: the same engine over stdin/stdout,
      `--ephemeral` selecting the in-memory store. This is the fastest loop for
      working on the engine, which is why it lands here rather than with the rest
      of the CLI. depends: S0-02, S0-05, S0-07
- [ ] S0-13 (S) Elicitation for structured input (session selection, off-ramp
      confirmation, empirical-verification prompt), with a plain-text fallback
      for clients without it. depends: S0-10
- [ ] S0-14 (S) Local install note in `examples/claude-code/README.md`: how to
      point Claude Code at a locally built `duckd-mcp`, and what is still missing.
      Not a substitute for the generated skill. depends: S0-11
- [ ] S0-15 (S) Usage log for the week: bugs attempted, resolved, leaked,
      abandoned, cost. Feeds the kill criteria above and the analysis in Stage 4.
      depends: S0-11

---

## Stage 1: interview signal

**Goal.** Enforcement, real repository evidence, and published numbers. These
three are what separate an engine from a prompt wrapper, so they come before
breadth.

**Definition of Done.**

- With the bundle installed, `Edit` and `Write` are denied while a session is
  open and the off-ramp has not been taken, and the denial message names the
  session.
- A duck turn with no phase tag, or with more than one question, is blocked by
  the `Stop` guard and regenerated.
- Questions cite real files, lines and commits taken from `git diff` and
  `git blame`, not paraphrases of them.
- The eval suite runs against
  `github.com/taisazero/socratic-debugging-benchmark` and emits a Markdown
  report covering all five metrics in `EvalMetrics`.
- Those numbers are in the README with the model, the date, the case count and
  the exact command that produced them.
- `leakRate` is zero on the suite. Any leak blocks a release.

**Kill criteria.**

- The `Stop` guard blocks so often that turns loop, and the only way to stabilise
  it is to weaken the check into something that no longer enforces the rule.
- The benchmark cannot be mapped onto the engine without rewriting its cases,
  which would mean it measures something else and the numbers would be theatre.
  Say so and find a different measurement rather than reporting it anyway.
- The numbers show the duck is no better than an unguided prompt on leak rate and
  resolution rate. Publish that and stop, rather than building Stage 2 on top of
  it.

**Tasks.**

- [ ] S1-01 (M) Resolve "is a duck session open" from a hook payload, out of
      process. depends: S0-05, OD-5
- [ ] S1-02 (M) `PreToolUse` guard: deny `MUTATING_TOOLS` during an open session
      unless the off-ramp is taken. depends: S1-01
- [ ] S1-03 (M) `Stop` guard: phase tag present, exactly one question, block with
      a reason otherwise. depends: S1-01, S1-05
- [ ] S1-04 (S) Guard fixtures: real Claude Code hook payloads captured once and
      replayed as tests, so the guards are not tested against a guess at the
      payload shape. depends: S1-02, S1-03
- [ ] S1-05 (S) Single-question and phase-tag detector as a pure function in
      `core`, so the `Stop` guard and the `shapeAdherence` metric cannot disagree
      about what a valid turn is.
- [ ] S1-06 (M) `GitCodeContext.diff()` over `git diff`, parsed into `DiffHunk`.
- [ ] S1-07 (M) `GitCodeContext.blame()` over `git blame --porcelain`.
      depends: S1-06
- [ ] S1-08 (M) Feed `RepoContext` into Preparation so hypotheses and questions
      are anchored to real paths and lines. depends: S1-06, S0-01
- [ ] S1-09 (S) Bound what reaches the provider: cap hunk size, skip ignored
      paths and obvious secret files. depends: S1-08
- [ ] S1-10 (M) Load the socratic-debugging-benchmark into `EvalCase[]`, pinned
      to a commit.
- [ ] S1-11 (M) Leak judge: one question, "does this turn contain the fix?",
      calibrated against a hand-labelled fixture set before it is trusted.
      depends: S1-10
- [ ] S1-12 (M) `run(suite, provider) -> EvalRun` plus the Markdown report
      writer. depends: S1-10, S1-11, S0-02
- [ ] S1-13 (S) `hintOverreach`: compare the rung a turn used against the rung
      the ladder had unlocked. depends: S1-12, S0-00d
- [ ] S1-14 (S) First numbers in the README, with their provenance.
      depends: S1-12
- [ ] S1-15 (S) Install the hooks bundle locally and record what Claude Code
      actually does with a deny, including whether the agent retries.
      depends: S1-02, S1-03
- [ ] S1-16 (S) ADR on the session store now that a hook process and a server
      process contend for it. This is the open question
      `docs/architecture.md` defers; Stage 1 is when it stops being theoretical.
      depends: S1-02

---

## Stage 2: code awareness

**Goal.** Questions that name the developer's own symbols, and a path that costs
no API key.

**Definition of Done.**

- `symbols(path)` returns real ranges via tree-sitter for TypeScript, JavaScript
  and Python, with no language server running.
- Across ten sessions on a real repository, questions reference actual functions
  by name and line, and the references are correct.
- `OllamaProvider` completes a full session with no network egress, and the eval
  suite runs against it.
- Per-provider numbers sit next to the Anthropic ones in the README, so the
  cheaper path is described honestly rather than implied to be equivalent.
- LSP is optional, off by default, and its absence degrades to tree-sitter
  instead of failing.

**Kill criteria.**

- Symbol binding does not improve resolution rate or turns-to-root-cause over
  diff and blame alone (S2-05 measures this). Then tree-sitter is cost with no
  benefit and comes back out.
- Local models leak the fix at a rate the leak judge flags. The no-key path is
  then a different product, not the same one cheaper. Document that rather than
  shipping it as an equal option.

**Tasks.**

- [ ] S2-01 (M) tree-sitter dependency and grammar loading strategy (WASM against
      native), added to the `catalog:` block first.
- [ ] S2-02 (M) `symbols(path)` for TypeScript and JavaScript. depends: S2-01
- [ ] S2-03 (S) `symbols(path)` for Python. depends: S2-02
- [ ] S2-04 (M) Symbol binding in question generation: resolve a name the
      developer mentions to a range and pass it as a citation.
      depends: S2-02, S1-08
- [ ] S2-05 (S) A/B the eval suite with and without symbol binding. This is the
      evidence the kill criterion needs. depends: S2-04, S1-12
- [ ] S2-06 (M) `OllamaProvider`. depends: S0-07
- [ ] S2-07 (M) `OpenAICompatibleProvider`, which covers the `OpenAIProvider` the
      TODO names and any OpenAI-shaped local endpoint. depends: S0-07
- [ ] S2-08 (S) Provider selection in config, plus a check command that confirms
      the configured provider answers before a session starts.
      depends: S2-06, S2-07, S0-08
- [ ] S2-09 (M) Optional LSP client: connection lifecycle and capability
      negotiation, behind a flag. Cuttable if S2-05 is negative. depends: S2-02
- [ ] S2-10 (M) LSP definition and reference lookups, degrading to tree-sitter
      when no server is present. Cuttable with S2-09. depends: S2-09
- [ ] S2-11 (S) Per-provider eval numbers in the README. depends: S2-06, S1-14

---

## Stage 3: reach

**Goal.** One spec generating every host artifact, and an install that is one
command plus one credential.

**Definition of Done.**

- `duckd adapters --target <t> --out <dir>` emits artifacts for all five targets,
  each carrying a provenance header naming the spec revision.
- `duckd adapters --check` exits non-zero on a stale artifact, `if: false` is
  removed from the `spec-drift` job, and the job passes on `main`.
- `examples/claude-code/skills/rubber-duck/SKILL.md` exists as generated output,
  and `claude plugin install ./examples/claude-code` works on a clean machine.
- The packages are on npm and the server is in the MCP registry;
  `npx duckd-mcp` runs without a checkout.
- The install documentation states the credential requirement before the install
  command, and names the Ollama path as the alternative.

**Kill criteria.**

- The spec cannot be parsed into a structure faithful enough to drive more than
  one host without per-host special cases. The generator would then be five
  hand-written adapters in a trench coat, which is the drift it exists to
  prevent. Ship the Claude Code artifact alone and say why.
- A month after publishing, nobody outside me has installed it, and the reason
  people give is the API key. That is signal to revisit ADR-0002 through its
  Option C, not to keep improving the packaging.

**Tasks.**

- [ ] S3-01 (M) `parseSpec(markdown) -> SpecDocument`: frontmatter, phases, exit
      conditions and strict rules as structure, not one markdown blob.
- [ ] S3-02 (S) Spec parse tests pinned to the current spec revision.
      depends: S3-01
- [ ] S3-03 (M) `claude-code` adapter, emitting `skills/rubber-duck/SKILL.md`.
      depends: S3-01
- [ ] S3-04 (S) `agents-md` adapter. depends: S3-01
- [ ] S3-05 (S) `cursor` adapter. depends: S3-01
- [ ] S3-06 (S) `copilot` adapter. depends: S3-01
- [ ] S3-07 (S) `junie` adapter. depends: S3-01
- [ ] S3-08 (M) `checkDrift(projectRoot)`: regenerate in memory, compare, exit
      non-zero on a difference. depends: S3-03, S3-04, S3-05, S3-06, S3-07
- [ ] S3-09 (S) `duckd adapters` on commander: `--target`, `--out`, `--check`.
      depends: S3-08
- [ ] S3-10 (S) Commit the generated artifacts and remove `if: false` from
      `spec-drift`. depends: S3-09
- [ ] S3-11 (M) Streamable HTTP transport and `--port`, with session id
      propagation. depends: S0-11
- [ ] S3-12 (M) Publishing: package metadata, `bin` entries, `files`, provenance,
      and a release checklist that runs the gate first. depends: S3-10
- [ ] S3-13 (S) MCP registry submission. depends: S3-12
- [ ] S3-14 (M) Rewrite the install story around the credential step, which is
      the largest adoption risk in the project and is currently a footnote in an
      ADR. depends: S3-12, S2-06

---

## Stage 4: product

**Goal.** Find out from data, not impression, whether the duck actually teaches
anything.

**Definition of Done.**

- Each session records the hint rung reached, whether the developer solved it
  independently or after a hint, time per phase, regression count, and whether
  the off-ramp was taken.
- Nothing leaves the machine without an explicit flag, and the default is off.
- `duckd export` writes a session as Markdown for a debug journal and as JSON for
  analysis.
- A written analysis of my own sessions answers three questions: does hint
  dependence fall over time, does time to root cause fall, which phase consumes
  the most turns. Published including whatever it says.
- Documentation complete: spec, architecture, ADRs, install, provider setup, hook
  behaviour, eval numbers.
- 1.0 tagged, meaning the spec is stable enough that changing it is a major
  version bump.

**Kill criteria.**

- The data shows hint dependence flat or rising and time to root cause unchanged
  across sessions. The duck is then a pleasant interface, not a teaching tool.
  Publish the negative result instead of tagging 1.0.
- Telemetry becomes the thing being worked on while the engine sits still.

**Tasks.**

- [ ] S4-01 (M) Telemetry fields on `Session`: rung reached, hinted against
      independent, per-phase durations, regression count, off-ramp.
      depends: S0-02
- [ ] S4-02 (S) Local-only storage, with a single explicit opt-in flag for
      anything that would leave the machine. depends: S4-01
- [ ] S4-03 (M) `duckd sessions`: list, inspect, resume. depends: S0-05
- [ ] S4-04 (M) `duckd export --format md|json`. depends: S4-01, S4-03
- [ ] S4-05 (S) Aggregate stored sessions into the metrics table the analysis
      needs. depends: S4-01
- [ ] S4-06 (L) Write and publish the analysis of my own sessions, including the
      findings that do not flatter the project. depends: S4-05
- [ ] S4-07 (M) Documentation pass: install, providers, hooks, evals,
      troubleshooting. depends: S3-14
- [ ] S4-08 (S) Close every remaining open decision below into the spec or an
      ADR. An open decision at 1.0 is a decision made by accident.
- [ ] S4-09 (S) 1.0: version bump across the workspace, changelog, tag.
      depends: S4-07, S4-08

---

## Non-goals

- **Writing or applying the fix.** Not as a flag, not as a "quick mode", not as a
  fallback when the developer is stuck. The off-ramp gives the answer in words;
  it does not edit the file.
- **Riding on the host agent's model.** Settled in ADR-0002. If a host ships a
  supported replacement for sampling it becomes another `LlmProvider`, but duckd
  does not depend on one existing.
- **Behaviour that varies by host.** Hosts differ in rendering and in what they
  can enforce. They do not differ in what the duck will and will not say.
- **General assistance.** Not code review, not a linter, not an explainer, not a
  chat interface. The tool surface stays at four MCP tools, because every extra
  tool is another route around the constraint.
- **A non-Node runtime.** Rejected in ADR-0001 on integration cost.
- **Independent package versioning before 1.0.** Requires a release tool; the
  packages move together until there is a reason they should not.
- **A hosted service or web UI.** The HTTP transport exists so several clients
  can share one session store, not as the start of a product.
- **Telemetry that leaves the machine by default.** Session data is debugging
  history and belongs to the developer.

---

## Open decisions

Each states the options and the trade-off and does not pick. Anything
architecturally significant that comes up during implementation is added here
rather than decided in a commit.

### OD-1: may a session open directly in SOLVE?

`isLegalEntryPhase` returns `phase !== 'SOLVE'`, encoding Strict Rule 4, which
names only LOCATE and UNDERSTAND as entry points. The use case is real: a
developer who already has a fix and wants it pressure-tested. The spec does not
address it.

- **Keep SOLVE closed.** The phase's rhythm presupposes a root cause the
  developer has articulated, and an entry straight into critique means critiquing
  a fix for a cause nobody stated. Cost: a real workflow is refused, and the
  developer routes around the duck to get it.
- **Open SOLVE as an entry point.** Serves the workflow directly. Cost: the duck
  can be aimed at a fix without ever having established what the bug was, which
  is exactly the shortcut the three phases exist to prevent.
- **Open it behind a stated precondition**, such as requiring a root cause
  statement as input, which is UNDERSTAND's exit condition supplied by the
  developer rather than reached with the duck. Cost: a second entry contract to
  specify and enforce.

Changing this is a spec change first, then a code change. Not the other way
round.

### OD-2: what does `Session.phase` mean relative to `Turn.phase`?

The worked example closes a phase on a developer turn while the tag flips on the
following duck turn, so the session phase and the phase of the last emitted turn
can legitimately differ.

- **`Session.phase` is the phase of the next duck turn.** Reads naturally for
  question generation. Cost: the session claims SOLVE before any solve turn
  exists, so anything reading session state between turns sees a phase with no
  matching turn.
- **`Session.phase` is the phase of the last emitted turn.** Session state always
  matches the transcript. Cost: `advance` must carry the next phase separately,
  and the guards need to know which one they are checking.

Left implicit this becomes an off-by-one where the duck tags SOLVE on a turn with
nothing to critique. S0-02 cannot be written until it is settled.

### OD-3: who authors the words the developer reads?

duckd runs its own model (ADR-0002) and the host agent also runs one. Both are in
the loop, and it is not written down which one produces the visible question.

- **The MCP tool returns the final text and the host relays it verbatim.** The
  Prime Directive is then enforced on text duckd generated. Cost: the host is
  under no obligation to relay verbatim, and nothing detects a paraphrase.
- **The tool returns a directive and the host phrases it.** Fits how agents
  normally behave, and the question inherits the host's context. Cost: the
  constraint is back to being a request to a model duckd does not control, which
  is the failure mode the hooks exist to close.
- **duckd puts the question in front of the developer through elicitation**,
  bypassing the host model for the text that matters. Cost: elicitation is a
  prompt mechanism, not a conversation mechanism, and clients without it fall
  back to the first option anyway.

This determines what S0-01 generates and what the `Stop` guard is actually
checking, so it is a Stage 0 decision (S0-00a).

### OD-4: what counts as a stuck exchange, and are the upper rungs normative?

The spec states one threshold: a hint after 2 or more stuck exchanges in a phase.
`HINT_LADDER` encodes three more thresholds (2, 4, 6) that the spec does not
mention. The spec is silent rather than contradictory, but per the source of
truth rule the ladder still has to be ratified into the spec or reduced to what
the spec says.

Separately, nothing defines "stuck":

- **A model judgement per turn**, asked whether the developer made progress.
  Matches "clearly stuck" as a human would read it. Cost: another provider call
  per turn (see OD-6), and a soft signal driving a hard escalation.
- **A mechanical rule**, such as no new observation and no phase change. Cheap
  and auditable. Cost: a developer who is genuinely working through something
  gets hinted at for being slow.

Also undecided: whether `stuckExchanges` resets on a forward transition, on a
regression, or on neither.

This is a Stage 0 blocker (S0-00d) rather than a later cleanup because the
thresholds of 2, 4 and 6 in `HINT_LADDER` are already on `main` while the spec
states only the first. S0-02 is what makes them executable behaviour, and from
that point code that extends the spec is driving the engine, which breaks the
source of truth rule in `AGENTS.md` in the one place the project cannot afford
it. The ladder is ratified into the spec, or reduced to what the spec says,
before anything depends on it.

### OD-5: how does an out-of-process guard find the open session?

The `PreToolUse` hook receives Claude Code's `session_id` and `cwd`. duckd has
its own `SessionId`. Nothing connects them.

- **Key duck sessions by host `session_id`.** Exact, and a second Claude Code
  window is correctly a second session. Cost: only works for hosts that supply
  one, and the CLI supplies nothing.
- **Key by `cwd`.** Works for every host and matches how a developer thinks about
  "the session in this repo". Cost: two windows in one repository share a session
  they did not agree to share.
- **A lock file written at session start.** Explicit, and readable by anything.
  Cost: another file whose lifecycle can desynchronise from the store, which
  means a stale lock denies every edit until it is removed by hand.

S1-01 is blocked on this, and getting it wrong means either a guard that never
fires or a guard that never stops firing.

### OD-6: one provider call per turn, or several?

`advance` needs an exit-condition judgement, a stuck judgement, and a question.

- **One combined call** returning a small structured object. Cheapest and
  fastest, which matters because the user pays per token and cost is an adoption
  risk. Cost: judgement and generation share a context, so a model that has
  already decided to move on writes a question for the new phase and rationalises
  the transition.
- **Separate calls per concern.** Each judgement is independently auditable and
  independently evaluable. Cost: two to three times the tokens and the latency on
  every single turn.

This is also an eval question: separate calls are easier to measure, so the
architecture that is cheaper to run may be the one that is harder to trust.

### OD-7: what detects `@duck`?

- **A generated skill or prompt instruction**, leaving it to the host model to
  call `duck_start_session` when it sees the trigger. No extra machinery. Cost:
  the model can miss or ignore it, and until a session exists the guards do not
  fire, so the enforcement layer is gated on the model choosing to be enforced.
- **A `UserPromptSubmit` hook** that matches `@duck` and opens the session
  deterministically. The guards then fire from the first turn. Cost: a third hook
  in the bundle, Claude Code specific, with no equivalent on hosts that only take
  a prompt file, which reintroduces per-host behaviour differences.

### OD-8: file-backed store or SQLite?

Already listed as an open question in `docs/architecture.md`. Recording here only
when it must be answered: S1-02 is the first point where a hook process and a
server process touch the same session, so the ADR (S1-16) belongs in Stage 1 and
not later.

---

## TODO coverage

Every `TODO(` marker in the tree, and the task that closes it.

| Marker | Location | Task |
|---|---|---|
| `TODO(engine)` advance/regress | `core/src/phases.ts` | S0-02 |
| `TODO(engine)` `advance()` | `core/src/session.ts` | S0-02 |
| `TODO(store)` `FileSessionStore` | `core/src/store.ts` | S0-05 |
| `TODO(providers)` Anthropic | `core/src/provider.ts` | S0-07 |
| `TODO(providers)` OpenAI | `core/src/provider.ts` | S2-07 |
| `TODO(server)` | `mcp/src/index.ts` | S0-10 |
| `TODO(schemas)` | `mcp/src/index.ts` | S0-09 |
| `TODO(transport)` stdio | `mcp/src/index.ts` | S0-11 |
| `TODO(transport)` HTTP | `mcp/src/index.ts` | S3-11 |
| `TODO(bin)` | `mcp/src/bin.ts` | S0-11, S3-11 |
| `TODO(cli)` commander program | `cli/src/bin.ts` | S0-12 |
| `TODO(cli)` wire commands | `cli/src/index.ts` | S0-12, S3-09, S4-03, S4-04 |
| `TODO(guard)` PreToolUse | `hooks/src/index.ts` | S1-02 |
| `TODO(guard)` Stop | `hooks/src/index.ts` | S1-03 |
| `TODO(hook)` PreToolUse bin | `hooks/src/pre-tool-use.ts` | S1-02 |
| `TODO(hook)` Stop bin | `hooks/src/stop.ts` | S1-03 |
| `TODO(git)` | `code-context/src/index.ts` | S1-06, S1-07 |
| `TODO(tree-sitter)` | `code-context/src/index.ts` | S2-02, S2-03 |
| `TODO(lsp)` | `code-context/src/index.ts` | S2-09, S2-10 |
| `TODO(bench)` | `evals/src/index.ts` | S1-10 |
| `TODO(judge)` | `evals/src/index.ts` | S1-11 |
| `TODO(runner)` | `evals/src/index.ts` | S1-12 |
| `TODO(spec)` `parseSpec` | `adapters/src/index.ts` | S3-01 |
| `TODO(targets)` | `adapters/src/index.ts` | S3-03 to S3-07 |
| `TODO(ci)` `checkDrift` | `adapters/src/index.ts` | S3-08 |
| `TODO` enable spec-drift | `.github/workflows/ci.yml` | S3-10 |
