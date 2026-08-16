import type { HintLevel } from './hints.js'
import type { Phase } from './phases.js'

export type SessionId = string

export type Role = 'developer' | 'duck'

export interface Turn {
  readonly role: Role
  readonly text: string
  /** The phase the duck was in when this turn was produced. */
  readonly phase: Phase
  readonly at: string
}

export interface Session {
  readonly id: SessionId
  readonly createdAt: string
  readonly updatedAt: string
  /** Free-text problem statement the developer opened with. */
  readonly problem: string
  readonly phase: Phase
  readonly turns: readonly Turn[]
  /** Consecutive exchanges without progress in the current phase; drives the hint ladder. */
  readonly stuckExchanges: number
  readonly hintLevel: HintLevel
  /**
   * Private competing hypotheses (Preparation step 2). Persisted so a resumed
   * session keeps its investigative spread, never rendered to the developer.
   */
  readonly hypotheses: readonly string[]
  /** Set once the developer takes the off-ramp; the duck stops withholding. */
  readonly offRampTaken: boolean
  readonly resolution?: 'verified' | 'abandoned'
}

// TODO(engine): `advance(session, developerTurn, provider)` -> next duck turn.
// This is where the state machine, the hint ladder and the provider meet, and it
// is the only place allowed to decide a phase transition.
