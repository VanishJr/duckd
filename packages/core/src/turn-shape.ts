/**
 * What a well shaped duck turn is, as one function, for S1-05.
 *
 * A well-formed turn opens with one of the three exact phase tags in `PHASE_TAGS`
 * (`docs/spec/socratic-protocol.md:55`), has a non-empty body after that tag
 * (line 120), and carries exactly one question (line 97), except in SOLVE, where
 * the one thing may be a critique or a pointed question (line 88) and so zero or
 * one question is well formed while two is not (line 97, "Never stack multiple
 * questions"). A turn with no opening tag has no phase and none is inferred from
 * the text (line 121). A tag string appearing after the opening one is body text
 * (line 119).
 *
 * This file counts questions and finds a tag. It does not judge whether a SOLVE
 * body is substantively one critique, and it does not detect a turn that hands
 * over the fix; that is leak detection (S1-11).
 *
 * Pure: no I/O, no state, and nothing imported from outside this package.
 */

import { PHASE_TAGS, PHASES, type Phase } from './phases.js'

export type TurnShapeProblem =
  | 'missing-phase-tag'
  | 'empty-body'
  | 'missing-question'
  | 'too-many-questions'

export interface TurnShape {
  /** True exactly when `problems` is empty. */
  readonly ok: boolean
  /** The phase carried by the opening tag, or undefined when there is no opening tag. */
  readonly phase: Phase | undefined
  /** The text after the opening tag, with whitespace at both ends removed. */
  readonly body: string
  /** Questions counted in the body. See `countQuestions`. */
  readonly questions: number
  readonly problems: readonly TurnShapeProblem[]
}

/**
 * Fenced code blocks, then inline code spans. Both are removed from the body
 * before questions are counted.
 *
 * Not a spec rule. The spec says nothing about code inside a turn; this is the
 * assumption recorded against S1-05 as a gap, so that a quoted symbol such as
 * `user?.name` is not read as a question.
 */
const FENCED_CODE = /```[\s\S]*?```/g
const INLINE_CODE = /`[^`]*`/g

/** A maximal run of one or more question marks. */
const QUESTION_RUN = /\?+/g

/**
 * How many questions a body carries.
 *
 * Not a spec rule. The spec requires "exactly ONE question" without saying how a
 * question is identified in text; counting runs of '?' outside code is the
 * assumption recorded against S1-05 as a gap. Under it "Really??" is one question
 * and "Where? Why?" is two.
 */
function countQuestions(body: string): number {
  const withoutCode = body.replace(FENCED_CODE, ' ').replace(INLINE_CODE, ' ')
  return (withoutCode.match(QUESTION_RUN) ?? []).length
}

/**
 * Decide whether a duck turn carries a phase tag and the number of questions its
 * phase allows.
 *
 * Takes the raw turn text. The phase whose allowance is applied is the one parsed
 * out of the opening tag; no other source of phase is consulted, and that choice
 * is recorded against S1-05 as a gap rather than as a spec rule.
 */
export function checkTurnShape(text: string): TurnShape {
  // Leading whitespace before the tag is tolerated. Not a spec rule: the spec says
  // "at the very start of your response" without saying whether a leading newline
  // breaks that, and tolerating it is the assumption recorded against S1-05 as a gap.
  const trimmed = text.trimStart()

  // Only the opening tag is matched, so a tag occurring later in the text is body
  // text and not a second phase claim (spec line 119).
  const phase = PHASES.find((candidate) => trimmed.startsWith(PHASE_TAGS[candidate]))

  if (phase === undefined) {
    // Spec line 121: the phase is reported as absent, not inferred from the text.
    // No question allowance is applied, because the allowance belongs to a phase
    // and there is no phase here.
    const body = trimmed.trimEnd()
    return {
      ok: false,
      phase: undefined,
      body,
      questions: countQuestions(body),
      problems: ['missing-phase-tag'],
    }
  }

  const body = trimmed.slice(PHASE_TAGS[phase].length).trim()
  const questions = countQuestions(body)
  const problems: TurnShapeProblem[] = []

  // Spec line 120: a bare tag, or a tag followed only by whitespace, is malformed.
  if (body === '') {
    problems.push('empty-body')
  }

  if (questions > 1) {
    // Spec line 97: no phase, SOLVE included, permits more than one question.
    problems.push('too-many-questions')
  } else if (questions === 0 && phase !== 'SOLVE') {
    // Spec line 97: outside SOLVE the body carries exactly one question, so zero is
    // malformed too. In SOLVE the one thing may be a critique instead (line 88), so
    // zero questions there is well formed, and one pointed question is equally well
    // formed in every phase.
    problems.push('missing-question')
  }

  return { ok: problems.length === 0, phase, body, questions, problems }
}
