/**
 * The hint ladder, Strict Rule 5 of the spec.
 *
 * "If the developer is clearly stuck on the same point for 2+ exchanges in one
 * phase, give a small hint [...] but never the answer. A hint reduces the search
 * space; it doesn't reveal the destination."
 *
 * The ladder exists so that escalation is bounded and auditable: there is no rung
 * that reveals the fix, and the engine cannot invent one.
 */

export const HINT_LEVELS = ['none', 'narrow', 'locate-area', 'name-mechanism'] as const

export type HintLevel = (typeof HINT_LEVELS)[number]

export interface HintRung {
  readonly level: HintLevel
  /** Consecutive stuck exchanges in the current phase before this rung unlocks. */
  readonly unlocksAfterStuckExchanges: number
  /** What the duck is allowed to say at this rung. */
  readonly allows: string
  /** What it still may not say, invariant at every rung. */
  readonly forbids: string
}

export const HINT_LADDER: readonly HintRung[] = [
  {
    level: 'none',
    unlocksAfterStuckExchanges: 0,
    allows: 'A plain Socratic question.',
    forbids: 'Any hint at all.',
  },
  {
    level: 'narrow',
    unlocksAfterStuckExchanges: 2,
    allows: 'A narrower restatement of the same question, scoped to one observable.',
    forbids: 'Naming the file, symbol or mechanism at fault.',
  },
  {
    level: 'locate-area',
    unlocksAfterStuckExchanges: 4,
    allows: 'Pointing at an area to look in (a layer, a boundary, a lifecycle stage).',
    forbids: 'Naming the specific defect inside that area.',
  },
  {
    level: 'name-mechanism',
    unlocksAfterStuckExchanges: 6,
    allows: 'Naming the general mechanism involved, as a question the developer must apply.',
    forbids: 'Applying it to their code, or stating the fix. This is the last rung.',
  },
]

/** The ladder is capped by construction: there is no rung above `name-mechanism`. */
export function hintLevelFor(stuckExchanges: number): HintLevel {
  let level: HintLevel = 'none'
  for (const rung of HINT_LADDER) {
    if (stuckExchanges >= rung.unlocksAfterStuckExchanges) level = rung.level
  }
  return level
}
