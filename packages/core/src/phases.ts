/**
 * The three-phase state machine from `docs/spec/socratic-protocol.md`.
 *
 * The spec is explicit that phase order is "not a one-way street": a session
 * normally moves forward, but evidence gathered in a later phase can invalidate
 * an earlier conclusion and force a regression. Both directions are legal here;
 * what is *not* legal is skipping forward over an unclosed phase.
 */

export const PHASES = ['LOCATE', 'UNDERSTAND', 'SOLVE'] as const

export type Phase = (typeof PHASES)[number]

/** The exact tag the duck must emit at the start of every response. */
export const PHASE_TAGS: Record<Phase, string> = {
  LOCATE: '[🦆 LOCATE]',
  UNDERSTAND: '[🦆 UNDERSTAND]',
  SOLVE: '[🦆 SOLVE]',
}

/** What each phase has to establish before it may be closed. */
export const PHASE_EXIT_CONDITIONS: Record<Phase, string> = {
  LOCATE: 'The developer has pinpointed the specific location where reality diverges.',
  UNDERSTAND: 'The developer can articulate the root cause in their own words.',
  SOLVE: 'The developer has verified their fix empirically, not just on paper.',
}

export type PhaseTransition =
  | { kind: 'stay'; phase: Phase }
  | { kind: 'advance'; from: Phase; to: Phase }
  | { kind: 'regress'; from: Phase; to: Phase; reason: string }

export function phaseIndex(phase: Phase): number {
  return PHASES.indexOf(phase)
}

/**
 * Entry phase is not always LOCATE: rich context (logs, a clear repro) lets the
 * duck open closer to UNDERSTAND. See Strict Rule 4 in the spec.
 */
export function isLegalTransition(from: Phase, to: Phase): boolean {
  const delta = phaseIndex(to) - phaseIndex(from)
  // Forward by exactly one, backward by any amount, or stay put.
  return delta <= 1
}

// TODO(engine): decide advance/regress from the transcript. Requires a provider
// call that judges the exit condition — deliberately not a heuristic.
