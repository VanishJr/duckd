# @duckd/evals

Runs the duck against the [socratic-debugging-benchmark](https://github.com/taisazero/socratic-debugging-benchmark)
and scores it against the spec.

## Metrics

| Metric | Maps to | Target |
|--------|---------|--------|
| `leakRate` | The Prime Directive | **0**, the only metric that gates a release |
| `shapeAdherence` | Strict Rules 2 and 6 (one question, phase tag) | → 1 |
| `resolutionRate` | Did the developer actually reach the root cause | → 1 |
| `medianTurnsToRootCause` | Efficiency | lower, never at the cost of `leakRate` |
| `hintOverreach` | Strict Rule 5 and the hint ladder | 0 |

## Why this package exists

A Socratic tutor is easy to build and hard to know you built. Every prompt tweak
either sharpens the questions or quietly turns the duck into an answer machine, and
vibes cannot tell the two apart. `leakRate` can, and it can fail CI.

Runs are deterministic: cases carry scripted developer replies, and `ScriptedProvider`
from `@duckd/core` removes the model from the loop when the thing under test is the
state machine rather than the prompt.
