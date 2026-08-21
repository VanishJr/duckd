/**
 * What a well shaped turn is, as tests, for S1-05.
 *
 * Written from runs/S1-05/plan-corrected.json in the autopilot repository, which is not in this
 * checkout. Every test below names the rule it exercises and the assert line it comes from, both
 * numbered as that plan numbers them, counting from 1.
 *
 * No test here names 3 of that plan's 11 rules. The plan states each one as a gap, meaning the spec
 * does not state it and the plan named an assumption instead, and a test naming one would freeze
 * that assumption. What a test file cannot avoid deciding, the shape of the call every case here
 * makes included, is frozen by this file whatever this paragraph says. The rules are listed so that
 * the absence reads as a decision:
 *
 * rule 9. Gap rule: the plan records its source as null, so how a question is identified in the
 * body text is assumed rather than stated by docs/spec/socratic-protocol.md. Freezing the
 * '?'-run-outside-code-spans counting rule in a test would settle the gap. The two assert lines
 * that turn on it, lines 10 and 11, are marked in the plan as waiting on this rule.
 * rule 10. Gap rule: the plan records its source as null. docs/spec/socratic-protocol.md:55 says
 * 'at the very start of your response' without saying whether leading whitespace before the tag
 * breaks that, and the plan assumes it is tolerated. The two assert lines that turn on it, lines 12
 * and 13, are marked in the plan as waiting on this rule.
 * rule 11. Gap rule: the plan records its source as null. It fixes the signature rather than the
 * outcome of any one assert line: every assert line in the plan names a raw turn string as its
 * input, so the suite calls checkTurnShape(text) and reads the phase out of the tag. No case
 * asserts that the tag beats a Session.phase or Turn.phase, because nothing in the plan states what
 * the function would receive alongside the text, and packages/core/src/session.ts is out of scope
 * for S1-05 per the plan's out_of_scope list.
 *
 * 4 of the plan's 14 assert lines have no test here because the plan marks them as waiting on a
 * rule it states as a gap. The outcome each one states is fixed by that assumption and by nothing
 * in the spec, so a test of it would freeze the assumption. Each is quoted whole, because what is
 * untested is what the line says and not what the rule it waits on says:
 *
 * assert 10, waiting on rule 9. '[🦆 LOCATE] Is `user?.name` set at that point?' returns questions
 * 1 and ok true, because the '?' inside the inline code span is not counted
 * assert 11, waiting on rule 9. '[🦆 LOCATE] Really??' returns questions 1 and ok true, because a
 * run of consecutive question marks is one question
 * assert 12, waiting on rule 10. '\n[🦆 LOCATE] Where does the value first diverge?', which begins
 * with a newline before the tag, returns phase 'LOCATE', ok true and problems [], not
 * 'missing-phase-tag'
 * assert 13, waiting on rule 10. '[🦆 LOCATE]   Where does the value first diverge?  \n' returns
 * body exactly 'Where does the value first diverge?': the leading and trailing whitespace is gone
 * and the string contains neither '[🦆' nor 'LOCATE]'
 *
 * This file is frozen. The implementation is measured against it, so nothing implementing the task
 * may edit it, move it or write over it. A test here that is wrong is wrong permanently, and the
 * way to answer one is to say so and change nothing.
 */

import { describe, expect, it } from 'vitest'
import { checkTurnShape } from './turn-shape.js'

describe('checkTurnShape', () => {
  // rule 1, assert 1. A well-formed duck turn opens with one of the three exact phase tags in
  // PHASE_TAGS, and the tag that opens the response is the one that carries the phase.
  it('a LOCATE turn with one question is well formed', () => {
    const result = checkTurnShape('[🦆 LOCATE] Have you confirmed the value at that point?')

    expect(result.ok).toBe(true)
    expect(result.phase).toBe('LOCATE')
    expect(result.questions).toBe(1)
    expect(result.problems).toEqual([])
  })

  // rule 3, assert 2. A turn with no opening tag has no phase: the function reports the phase as
  // absent rather than inferring one from the text.
  it('a turn with no opening tag has no phase', () => {
    const result = checkTurnShape('Have you confirmed the value at that point?')

    expect(result.phase).toBeUndefined()
    expect(result.ok).toBe(false)
    expect(result.problems).toContain('missing-phase-tag')
  })

  // rule 5, assert 3. Outside SOLVE the body carries exactly one question, so zero questions is
  // malformed as well as two.
  it('two questions in an UNDERSTAND turn is too many', () => {
    const result = checkTurnShape('[🦆 UNDERSTAND] What did you expect? What actually happened?')

    expect(result.questions).toBe(2)
    expect(result.ok).toBe(false)
    expect(result.problems).toContain('too-many-questions')
  })

  // rule 5, assert 4. Outside SOLVE the body carries exactly one question, so zero questions is
  // malformed as well as two.
  it('zero questions outside SOLVE is malformed', () => {
    const result = checkTurnShape('[🦆 LOCATE] The value diverges somewhere in that path.')

    expect(result.questions).toBe(0)
    expect(result.ok).toBe(false)
    expect(result.problems).toContain('missing-question')
  })

  // rule 6, assert 5. In SOLVE the single thing may be a critique rather than a question, so a
  // SOLVE body carrying zero questions is well formed.
  it('a SOLVE critique with no question mark is well formed', () => {
    const result = checkTurnShape(
      '[🦆 SOLVE] That fixes this call site and leaves the other writers untouched.',
    )

    expect(result.questions).toBe(0)
    expect(result.ok).toBe(true)
    expect(result.problems).toEqual([])
  })

  // rule 7, assert 6. In SOLVE the single thing may equally be a pointed question, so a SOLVE body
  // carrying exactly one question is well formed and is not reported as an extra or a missing
  // question. SOLVE relaxes the lower bound to zero, it does not forbid the one-question form.
  // The SOLVE turn of the worked example at docs/spec/socratic-protocol.md line 143.
  it('a SOLVE turn carrying one pointed question is well formed', () => {
    const result = checkTurnShape(
      '[🦆 SOLVE] That fixes this call site. What happens the next time someone updates that same array somewhere else in the codebase?',
    )

    expect(result.questions).toBe(1)
    expect(result.ok).toBe(true)
    expect(result.problems).toEqual([])
  })

  // rule 8, assert 7. No phase, SOLVE included, permits more than one question in one turn.
  it('the cap of one question applies in SOLVE too', () => {
    const result = checkTurnShape(
      '[🦆 SOLVE] Have you checked the other writers? What happens on the next update?',
    )

    expect(result.questions).toBe(2)
    expect(result.ok).toBe(false)
    expect(result.problems).toContain('too-many-questions')
  })

  // rule 4, assert 8. A turn that is a bare phase tag, or a tag followed only by whitespace, is
  // malformed.
  // The input is the SOLVE tag, three spaces and a newline, with nothing else after the tag.
  it('a tag followed only by whitespace has an empty body and is malformed', () => {
    const result = checkTurnShape('[🦆 SOLVE]   \n')

    expect(result.phase).toBe('SOLVE')
    expect(result.body).toBe('')
    expect(result.ok).toBe(false)
    expect(result.problems).toContain('empty-body')
  })

  // rule 2, assert 9. A tag string occurring anywhere after the opening tag is body text, not a
  // second phase claim, and does not make the turn malformed.
  it('a tag occurring after the opening one is body text', () => {
    const result = checkTurnShape('[🦆 LOCATE] Is [🦆 LOCATE] the phase you thought you were in?')

    expect(result.phase).toBe('LOCATE')
    expect(result.questions).toBe(1)
    expect(result.ok).toBe(true)
  })

  // rule 1, assert 14. A well-formed duck turn opens with one of the three exact phase tags in
  // PHASE_TAGS, and the tag that opens the response is the one that carries the phase.
  it('ok true comes with an empty problems list', () => {
    const result = checkTurnShape('[🦆 LOCATE] Have you confirmed the value at that point?')

    expect(result.ok).toBe(true)
    expect(result.problems).toHaveLength(0)
  })

  // rule 5, assert 14. Outside SOLVE the body carries exactly one question, so zero questions is
  // malformed as well as two.
  it('ok false comes with exactly the one problem found', () => {
    const result = checkTurnShape('[🦆 LOCATE] Where? Why?')

    expect(result.ok).toBe(false)
    expect(result.problems).toHaveLength(1)
  })
})
