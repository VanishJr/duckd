import { describe, expect, it } from 'vitest'
import { hintLevelFor } from './hints.js'
import { isLegalTransition, PHASE_TAGS, PHASES } from './phases.js'

describe('phase transitions', () => {
  it('allows advancing exactly one phase', () => {
    expect(isLegalTransition('LOCATE', 'UNDERSTAND')).toBe(true)
    expect(isLegalTransition('UNDERSTAND', 'SOLVE')).toBe(true)
  })

  it('forbids skipping an unclosed phase', () => {
    expect(isLegalTransition('LOCATE', 'SOLVE')).toBe(false)
  })

  it('allows regression to any earlier phase', () => {
    expect(isLegalTransition('SOLVE', 'LOCATE')).toBe(true)
    expect(isLegalTransition('SOLVE', 'UNDERSTAND')).toBe(true)
  })

  it('tags every phase', () => {
    for (const phase of PHASES) {
      expect(PHASE_TAGS[phase]).toContain(phase)
    }
  })
})

describe('hint ladder', () => {
  it('gives nothing away before the spec threshold of 2 stuck exchanges', () => {
    expect(hintLevelFor(0)).toBe('none')
    expect(hintLevelFor(1)).toBe('none')
    expect(hintLevelFor(2)).toBe('narrow')
  })

  it('is capped — escalation never reaches the answer', () => {
    expect(hintLevelFor(99)).toBe('name-mechanism')
  })
})
