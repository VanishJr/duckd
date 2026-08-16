# @duckd/hooks

Claude Code guard scripts that make the Prime Directive enforceable rather than merely stated.

## Why hooks at all

The spec tells the model not to hand over the fix. Models comply *most* of the time,
and the one session where it slips is the session where the developer learns nothing.
Hooks convert the rule into a mechanism the model cannot talk its way past.

| Hook | Guards |
|------|--------|
| `PreToolUse` | Denies `Edit` / `Write` / `MultiEdit` while a duck session is open, so the agent may not apply the fix |
| `Stop` | Blocks a duck turn missing its phase tag, or stacking more than one question (Strict Rules 2 and 6) |

Both are released from duty once the developer takes the off-ramp. The spec is clear
that the developer, not the duck, decides to skip the learning.
