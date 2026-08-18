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
  before the code can be written. A decision that is made twice, because the
  measurement that settles it cannot exist until the code runs, is recorded by
  its own task in the Stage 0 decision block, so a task blocked on the
  provisional half depends on that task and not on the decision. The task that
  ratifies or overturns the choice is named in the decision.
- An open decision states its options as list items opening with a bold span.
  That is a contract, not a formatting habit: a mechanical check reads the
  option set out of this file, and an option written as prose is invisible to
  it. The bold span is a short label and not the argument: at most 60
  characters once emphasis, backticks, case and trailing punctuation are
  stripped. The sentence explaining the option goes after the bold span rather
  than inside it, so `**Keep SOLVE closed.**` and `**One combined call**
  returning a small structured object.` are both correct. A label over the cap
  is an error the check reports, not an option it quietly accepts.
- Stages 0 and 1 are committed scope. Stages 2 through 4 are indicative: they
  exist to make the direction explicit, not to promise delivery. Reordering or
  cutting within 2 through 4 is expected and does not need an amendment to this
  document. Indicative rather than provisional, because provisional is used
  below in a different sense, for a choice made now and re-decided against
  evidence later.
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
- Over the week of real use, the share of sessions that had to be opened by hand
  because the host model missed the trigger stays under the threshold S0-00e
  names. Under OD-7's provisional choice a session exists only once the host
  model calls the tool, and a session that never opened is one the Stage 1
  guards can never fire on, so this is the bullet that tests whether that choice
  works.
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
  write the number down, decide against the number. The number S0-15 records is
  an upper bound: OD-6's provisional choice makes two to three provider calls per
  turn where one may do, so before this criterion fires, cost the combined call.
  Killing the project on the unoptimised figure kills it on a configuration
  chosen for reversibility rather than for price.

**Tasks.**

- [ ] S0-00a (M) Make OD-3's provisional choice, duckd authors the text the
      developer reads, and write it into an ADR that records it as provisional
      and names S0-15 as its ratification. This is not the final answer to OD-3,
      which cannot be given before the cost figure exists.
- [ ] S0-00b (S) Decide OD-2, Session.phase against Turn.phase. ADR.
- [ ] S0-00c (M) Make OD-6's provisional choice, separate calls per concern, and
      write it into an ADR that records it as provisional and names S1-12 as its
      ratification. Not the final answer to OD-6, which cannot be given before
      each judgement can be measured on its own.
- [ ] S0-00d (M) Decide OD-4. Ratify the ladder's structure into the spec, which
      is that it is bounded above, that every rung states what it still may not
      say, that no rung reveals the fix, and that escalation does not begin
      before two stuck exchanges. Declare the 4 and 6 thresholds configuration
      defaults; they do not go into the spec. Define "stuck" and the
      `stuckExchanges` reset rule in the same pass. This closes the source of
      truth violation: `hints.ts` then implements a ratified structure with
      configured values rather than extending the spec with numbers the spec
      never stated.
- [ ] S0-00e (S) Make OD-7's provisional choice, a prompt instruction rather
      than a `UserPromptSubmit` hook, and write it into an ADR that records it
      as provisional and names S0-15 as its ratification. Naming the threshold
      is part of this task: what share of sessions opened by hand is acceptable,
      written down before the data exists rather than chosen from it afterwards.
      The Stage 0 Definition of Done tests against that number and S0-15
      measures it. Not the final answer to OD-7, which cannot be given before
      the trigger has been missed or not missed in real use.
- [ ] S0-00f (S) Record OD-5's provisional choice, `cwd` as the key an
      out-of-process guard resolves a session by, in an ADR marked provisional
      that names S1-15 as its ratification. It sits in Stage 0 although the
      decision surfaces in Stage 1, because the reasoning is already written and
      an ADR scattered across stages is an ADR that does not get written.
- [ ] S0-00g (S) Record OD-8's provisional choice, the file-backed store, in an
      ADR marked provisional that names S1-16 as its ratification. In Stage 0
      for the same reason as S0-00f.
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
      off-ramp with giving up. That decides what a published number counts: the
      resolution rate S1-14 publishes is only meaningful once the two are
      separate, and a deliberate off-ramp is the mechanism working as designed
      rather than a failure, so folding it into abandonment understates the
      project's own numbers. depends: S0-02
- [ ] S0-05 (M) `FileSessionStore` under `~/.duckd/sessions/`: one JSON file per
      session, temp-file-plus-rename writes. depends: S0-00g
- [ ] S0-06 (S) Store conformance suite, run against both implementations so the
      in-memory store cannot drift from the file-backed one. depends: S0-05
- [ ] S0-07 (M) `AnthropicProvider`: credentials of its own, retry on transient
      failures, errors mapped to one actionable message.
- [ ] S0-08 (S) Credential resolution: env var, then `~/.duckd/config.json`,
      precedence documented. Startup fails clean and names the fix.
      depends: S0-07
- [ ] S0-09 (M) zod schemas for the four MCP tools, exported so the CLI validates
      the same shapes. The four are `duck_start_session` (open a session on a
      problem statement), `duck_respond` (one developer turn in, one duck turn
      out), `duck_get_session` (read session state for a resume or a guard) and
      `duck_end_session` (close on a verified fix or an abandoned session). That
      is the session lifecycle in `docs/architecture.md` and nothing beyond it:
      the off-ramp is a branch inside `duck_respond` (S0-04) and not a fifth
      tool. `TOOL_NAMES` in `packages/mcp/src/index.ts` already carries these
      four names; this task does not get to change them quietly.
- [ ] S0-10 (L) `createDuckServer(options)`: the four tools wired to `core` and
      `FileSessionStore`. How a session comes to be opened is OD-7, so the shape
      of `duck_start_session` follows S0-00e. depends: S0-02, S0-05, S0-09,
      S0-00e
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
      Not a substitute for the generated skill. What the note tells the reader to
      install for the trigger follows OD-7. depends: S0-11, S0-00e
- [ ] S0-15 (S) Usage log for the week: bugs attempted, resolved, leaked,
      abandoned, cost. Feeds the kill criteria above and the analysis in Stage 4.
      This is also where OD-3 is ratified: the cost per session recorded here is
      the figure S0-00a's ADR defers to, so this task either confirms the
      provisional choice or rewrites that ADR. Record the cost as an upper bound
      and say why: under OD-6's provisional choice the engine makes two to three
      provider calls per turn where one combined call may do, so this is the
      price of a configuration chosen for reversibility, not the shipping price.
      It ratifies OD-7 in the same pass, which means logging one more field: how
      many sessions had to be opened by hand because the host model missed the
      trigger. That count is the evidence S0-00e's ADR defers to.
      depends: S0-11, S0-00e

---

## Stage 1: interview signal

**Goal.** Enforcement, real repository evidence, and published numbers. These
three are what separate an engine from a prompt wrapper, so they come before
breadth.

**Definition of Done.**

- With the bundle installed, `Edit` and `Write` are denied while a session is
  open and the off-ramp has not been taken, and the denial message names the
  session.
- A duck turn with no phase tag, with an empty body, or with more than one
  question is blocked by the `Stop` guard and regenerated. So is a turn with no
  question at all, except in SOLVE, where the spec lets one critique stand in
  place of the question.
- Questions cite real files, lines and commits taken from `git diff` and
  `git blame`, not paraphrases of them.
- The eval suite runs against
  `github.com/taisazero/socratic-debugging-benchmark` and emits a Markdown
  report covering all five metrics in `EvalMetrics`.
- Those numbers are in the README with the model, the date, the case count and
  the exact command that produced them.
- `leakRate` is published with the case count and a confidence interval, and a
  release is blocked by a regression against the previous recorded run rather
  than by a fixed threshold. The judge in S1-11 is a model with its own error
  rate, so a demand for zero from a probabilistic system measured by a
  probabilistic instrument gets either quietly dropped or calibrated away, and
  both are worse than an honest number. An absolute bar can be set once the
  observed variance across runs is known.

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
      process. Keep the lookup behind one function so the key can be swapped
      when S1-15 ratifies OD-5. depends: S0-05, S0-00f
- [ ] S1-02 (M) `PreToolUse` guard: deny `MUTATING_TOOLS` during an open session
      unless the off-ramp is taken. depends: S1-01
- [ ] S1-03 (M) `Stop` guard: phase tag present, body non-empty, one question
      outside SOLVE and never more than one in any phase, block with a reason
      otherwise. depends: S1-01, S1-05
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
      paths and obvious secret files. The cap bounds cost as well as exposure:
      under OD-3's first option every hunk that passes it is paid context on
      every turn. Record the per-turn token count at the chosen cap alongside
      the safety behaviour, so cost is a measured property of this task rather
      than something noticed later. depends: S1-08
- [ ] S1-10 (M) Load the socratic-debugging-benchmark into `EvalCase[]`, pinned
      to a commit.
- [ ] S1-11 (M) Leak judge: one question, "does this turn contain the fix?",
      calibrated against a hand-labelled fixture set before it is trusted.
      depends: S1-10
- [ ] S1-12 (M) `run(suite, provider) -> EvalRun` plus the Markdown report
      writer. This is also where OD-6 is ratified: with each judgement measurable
      on its own, the separate calls either earn their cost or collapse into one
      combined call. depends: S1-10, S1-11, S0-02
- [ ] S1-13 (S) `hintOverreach`: compare the rung a turn used against the rung
      the ladder had unlocked. depends: S1-12, S0-00d
- [ ] S1-14 (S) First numbers in the README, with their provenance, `leakRate`
      carrying its case count and confidence interval. This run is the recorded
      baseline that later runs are compared against, so it is stored, not only
      published. depends: S1-12, S0-04
- [ ] S1-15 (S) Install the hooks bundle locally and record what Claude Code
      actually does with a deny, including whether the agent retries. This is
      also where OD-5 is ratified: the payload observed here either confirms
      `cwd` or replaces the key with the host `session_id`.
      depends: S1-02, S1-03
- [ ] S1-16 (S) ADR on the session store now that a hook process and a server
      process contend for it. This is the open question
      `docs/architecture.md` defers; Stage 1 is when it stops being theoretical.
      It is where OD-8 is ratified, and it settles the writer count first and the
      format second: whether the hook writes at all decides whether files are
      still sufficient. depends: S1-02

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
- A local model's `leakRate` is worse than the baseline S1-14 recorded, and the
  two confidence intervals do not overlap, so the gap is not run-to-run noise
  (S2-11 measures this). The no-key path is then a different product, not the
  same one cheaper. Document that rather than shipping it as an equal option.

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
  people give is the API key. ADR-0002 leaves one response here that is mine to
  make: Option B's local path, which is what S2-06 and S3-14 exist for. So the
  check is whether that path is actually reachable, meaning it is documented
  before the install command, it runs without an account, and S2-11's numbers
  say honestly what it gives up. If it is reachable and people still do not
  install, the response is not Option C. Option C waits on some client shipping
  a supported replacement for sampling, which is not something I can do, and a
  criterion whose response is to wait for a third party is consolation. The
  response is to accept that duckd's audience is developers who already hold an
  API key or already run a local model, write that limit into the README as
  stated scope, and stop treating adoption outside it as a packaging problem.

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
  chat interface. The tool surface stays at the four MCP tools named in S0-09
  (`duck_start_session`, `duck_respond`, `duck_get_session`, `duck_end_session`),
  because every extra tool is another route around the constraint. The cost of
  that limit is that duckd can only speak, never act. It cannot run the tests,
  cannot reproduce the bug, cannot check whether the fix worked. The empirical
  close at the end of SOLVE is the developer going and running it, and that is
  structural rather than a missing feature. Any future addition along the lines
  of "let it at least run the test suite" is not a convenience change, it
  changes what duckd is.
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

- **duckd writes the text.** The MCP tool returns the final text and the host
  relays it verbatim. The Prime Directive is then enforced on text duckd
  generated. Cost: the host is under no obligation to relay verbatim, and
  nothing detects a paraphrase.
- **The host phrases it.** The tool returns a directive and the host phrases the
  question. Fits how agents normally behave, and the question inherits the
  host's context. Cost: the constraint is back to being a request to a model
  duckd does not control, which is the failure mode the hooks exist to close.
- **duckd elicits the question.** duckd puts the question in front of the
  developer through elicitation, bypassing the host model for the text that
  matters. Cost: elicitation is a prompt mechanism, not a conversation
  mechanism, and clients without it fall back to the first option anyway.

This determines what S0-01 generates and what the `Stop` guard is actually
checking, so it is a Stage 0 decision (S0-00a).

The second half of that is the larger half. If the tool returns the final text
and the host relays it, the `Stop` guard is checking text duckd generated
itself, and its remaining value is catching what the host added on top. If the
tool returns a directive and the host phrases the question, the guard is the
only mechanism holding the Prime Directive on text duckd did not write, and
S1-03 becomes the single most important task in Stage 1.

This is not only an authorship question, it decides the cost of a session and
whether duckd exists outside Claude Code. Reading code is tens of thousands of
tokens per turn; judging a transcript is hundreds. So the option matters mostly
through what enters the paid context, not through who does the reading. Under
the first option duckd sees the code, its bill scales with how tightly
`code-context` bounds the input, and S1-09 stops being a safety task and becomes
an economic one. Under the second option the host reads the code on its own
subscription and duckd only verifies, which is cheap by construction, but the
question is then written by a model that has already read the code and knows the
answer, so the strongest claim available drops from "duckd never generates a fix"
to "duckd rejects turns that fail a probabilistic check". That weaker claim also
rests entirely on the `Stop` hook, which exists in Claude Code and has no
equivalent in Cursor, Copilot or Junie. Enforcement is expected to differ in
strength across hosts, and the Non-goals section allows that. What it does not
allow is enforcement existing in one host and being absent in the rest, which is
what the second option produces: elsewhere the question is written by a model
that has read the code, with nothing holding it. Under the first option the
refusal is a property of the text itself, because duckd wrote it, and the hook is
a second line rather than the only one. The real choice is therefore between
cheap and Claude Code only, and costlier but independent of any host. Decide
against the cost figure S0-15 records, not at the desk.

Decided on Stage 0 convenience alone, that consequence surfaces long after the
decision, in a stage whose shape it already changed.

The cost figure does not exist until a week of real use has produced it, and that
week needs an engine which has already picked an option, so OD-3 is decided
twice. The provisional choice is the first option, duckd sees the code and writes
the question. It is selected on cost of reversal rather than on expected
correctness: text duckd generated can be demoted to a directive later, while an
engine that only ever emitted directives has no question generator to promote, so
the first option forecloses nothing and the second forecloses the first. S0-00a
records that choice in an ADR that states it is provisional and names its
ratification. S0-15 is that ratification: measured against the cost per session
it either confirms the provisional choice or forces the ADR to be rewritten.

### OD-4: what counts as a stuck exchange, and what in the ladder is normative?

The spec states one threshold: a hint after 2 or more stuck exchanges in a phase.
`HINT_LADDER` encodes three more thresholds (2, 4, 6) that the spec does not
mention. The spec is silent rather than contradictory, but per the source of
truth rule the ladder still has to be ratified into the spec or reduced to what
the spec says.

The decide-twice pattern that OD-3, OD-5 and OD-6 use does not apply here. A spec
that is provisional is not a spec, and a normative document carrying a number
nobody can defend teaches its readers that its numbers are negotiable. The split
is between what is normative and what is a parameter, not between now and later.

Normative, and defensible without any measurement:

- The ladder is bounded above. There is a last rung, and the engine cannot invent
  one past it.
- Every rung carries an explicit list of what it still may not say.
- No rung reveals the fix.
- Escalation does not begin before two stuck exchanges.

That structure is what makes the constraint auditable rather than promised, and
none of it rests on a number. The threshold of 2 stays in the spec because it is
already there and has a stated basis.

Not normative: the 4 and 6 at which `locate-area` and `name-mechanism` unlock.
Nothing establishes those values and no measurement is planned that would. They
are configuration defaults, they belong in code, and changing one is a default
change rather than a spec change, so it does not force a major version bump after
S4-09.

What the split does not settle is the trigger. Nothing defines "stuck":

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
it. The split closes that violation: once S0-00d has ratified the structure and
declared the upper thresholds defaults, `hints.ts` implements a ratified
structure with configured values instead of extending the spec with numbers the
spec never stated.

S1-13 is unaffected either way. It compares the rung a turn used against the rung
the ladder had unlocked, which holds regardless of the threshold at which it
unlocked.

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

The three options can only be weighed against a real Claude Code hook payload,
and the task that observes one, S1-15, cannot run until a guard already exists.
So OD-5 is decided twice. The provisional choice is `cwd`, selected on cost of
reversal rather than on expected correctness: it works on every host, including
the bare CLI where no host `session_id` exists, so the guard runs everywhere
while the question is still open. S0-00f records that choice, S1-01 is blocked on
it rather than on the final one, and S1-01 keeps session lookup behind one
function so the key can be swapped. S1-15 is the ratification: against a real payload it
either confirms `cwd` or replaces it with the host `session_id`, which is then a
change to that one function.

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

That evidence arrives at S1-12, the first point where each judgement can be
measured on its own, and S1-12 needs an engine that already makes its calls one
way or the other. So OD-6 is decided twice. The provisional choice is separate
calls per concern, selected on cost of reversal rather than on expected
correctness: with three prompts in hand, merging them into one structured call is
a short piece of work, while splitting a single combined prompt means writing the
three that were never written. S0-00c makes that provisional choice, S1-12
ratifies it or collapses the calls into one.

The consequence has to be stated because it will otherwise fire on its own: the
option that is cheapest to reverse is the expensive one to run, at two to three
provider calls per turn instead of one. The cost per session S0-15 records is
therefore an upper bound produced by a deliberately unoptimised configuration,
not the shipping cost. The Stage 0 cost kill criterion and S0-15 both carry that
qualification, so the project is not killed on a number taken from a
configuration chosen for reversibility rather than for price.

### OD-7: what detects `@duck`?

- **A generated skill or prompt instruction**, leaving it to the host model to
  call `duck_start_session` when it sees the trigger. No extra machinery. Cost:
  the model can miss or ignore it, and until a session exists the guards do not
  fire, so the enforcement layer is gated on the model choosing to be enforced.
- **A `UserPromptSubmit` hook** that matches `@duck` and opens the session
  deterministically. The guards then fire from the first turn. Cost: a third hook
  in the bundle, Claude Code specific, with no equivalent on hosts that only take
  a prompt file, which reintroduces per-host behaviour differences.

The first option's cost is larger than the model occasionally missing a trigger.
Under it a session exists only once the host model chooses to call
`duck_start_session`, and until a session exists `PreToolUse` denies nothing, so
an agent that never opens the session was never constrained at any point. The
enforcement layer is gated on the model agreeing to be enforced, which is the
same failure mode the hooks exist to close. That is what is traded against the
second option's per-host divergence, and neither side of the trade is small.

This is the same argument OD-3 makes about the `Stop` hook, a mechanism present
in one host and absent in the rest, so the two are decided together rather than
separately.

OD-7 is decided twice. The provisional choice is the prompt instruction,
selected on cost of reversal rather than on expected correctness: adding a
`UserPromptSubmit` hook later is additive, while building the hook first and
removing it means the prompt path was never written and every host that is not
Claude Code has nothing at all. S0-00e makes that choice and records it. The
ratifying evidence is how often the host model misses or ignores the trigger,
which only real use shows, so S0-15 ratifies OD-7 alongside OD-3, against the
threshold S0-00e names.

### OD-8: how many processes write to a session, and therefore file or SQLite?

Already listed as an open question in `docs/architecture.md`, where it is written
as a storage format choice. The format follows from a question underneath it: how
many processes may write to a session.

- **One JSON file per session, with temp-file-plus-rename writes.** What S0-05
  ships, and sufficient while no two processes hold one session at the same time.
  Cost: it holds only while that stays true, and the hook will want to write, to
  record that it denied an edit or to increment the stuck counter.
- **SQLite.** Real concurrent access control, which is what two processes
  contending for one session require. Cost: a dependency and a schema before
  anything has shown either is needed.

If the hook also writes, two processes contend for one session, real concurrent
access control is required, and the format is a consequence rather than a
choice. Decided as a library choice, this gets picked on ease of installation.

Three states have to be kept apart here, because the writer count is different in
each and an earlier version of this section collapsed them.

Nothing writes a session today. `packages/core/src/store.ts` holds the
`SessionStore` interface, `InMemorySessionStore` and `TODO(store)`, so no durable
store exists yet, and the `duckd-mcp`, `duckd` and guard binaries all print "not
implemented yet" and exit 1.

Two processes are specified to write, and both arrive in Stage 0. S0-10 wires the
server's four tools to `FileSessionStore`. S0-12 gives `duckd start` the same
engine with `--ephemeral` selecting the in-memory store, which makes the file
store its default as well. S4-03 adds `duckd sessions ... resume` later. So the
server is not the sole writer of the store from S0-12 onward, and this section
previously said it was.

The hook is the writer nobody has decided on. S1-02 denies mutating tools during
an open session; whether it also records a denial or increments the stuck counter
is what S1-16 settles, and S1-16 says so.

The format turns on that distinction rather than on the count. The server and the
CLI write the same directory but are not expected to hold one session at the same
time: a terminal session is the developer's own, and a resume is of a session
nobody has open. Temp-file-plus-rename covers that. It is an assumption and not a
guarantee, nothing in the tree enforces it, and a developer resuming from the
terminal a session an editor still has open would break it as a silent lost
update, which is the one failure a file store cannot report. The hook is
different in kind: it fires during a session the server has open, milliseconds
apart, which is contention for one session and is what real concurrent access
control exists for.

This weakens the case for files without overturning it. The argument used to be
that one process writes. It is now that several write and are not expected to
collide, which is a weaker claim resting on an assumption nobody has written down
as a constraint. If S0-12 or S1-02 shows the assumption does not hold, the
provisional choice is due for revisiting before S1-16 rather than at it.

OD-8 is decided twice and half of it is already made. The provisional choice is
the file-backed store S0-05 ships, selected on cost of reversal rather than on
expected correctness: `SessionStore` is an interface, which exists now, and
S0-06 will run the same conformance suite against every implementation, which is
unchecked and so is not written yet. Replacing the backing store is therefore one
more implementation behind an interface that already exists, against a suite
S0-06 still has to write, while opening on SQLite means a dependency and a schema
before anything has shown either is needed.
S0-00g records that choice, and S0-05 is blocked on it. S1-16 is the
ratification: with the writer count known rather than
guessed, it either confirms files or specifies what replaces them.

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
