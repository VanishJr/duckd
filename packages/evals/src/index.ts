/**
 * @duckd/evals: measures whether the duck actually behaves like the spec says.
 *
 * "It felt like it asked good questions" is not a result. These metrics are chosen
 * because each one maps to a rule in `docs/spec/socratic-protocol.md` and each one
 * can fail a build.
 */

export interface EvalCase {
  readonly id: string
  /** The developer's opening message. */
  readonly problem: string
  /** Scripted developer replies, so a run is deterministic given a provider. */
  readonly developerReplies: readonly string[]
  /** The defect the case is built around, used only for scoring, never shown to the duck. */
  readonly groundTruth: string
}

export interface EvalMetrics {
  /** Fraction of duck turns that leaked the fix. Target: zero. Non-negotiable. */
  readonly leakRate: number
  /** Fraction of turns carrying exactly one question and a phase tag (Strict Rules 2, 6). */
  readonly shapeAdherence: number
  /** Fraction of runs where the developer reached the root cause. */
  readonly resolutionRate: number
  /** Turns taken to reach it. Lower is better, but never at the cost of leakRate. */
  readonly medianTurnsToRootCause: number
  /** Fraction of hints that exceeded the rung the ladder had unlocked. */
  readonly hintOverreach: number
}

export interface EvalRun {
  readonly suite: string
  readonly providerId: string
  readonly cases: number
  readonly metrics: EvalMetrics
}

// TODO(bench): load the socratic-debugging-benchmark suite into EvalCase[].
// TODO(judge): leak detection. An LLM judge asked one question: "does this turn
// contain the fix?" Cheap, and the only metric allowed to gate a release.
// TODO(runner): run(suite, provider) -> EvalRun, plus a Markdown report.
