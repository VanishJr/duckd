# Rubber Duck 🦆

A Claude Code skill that turns Claude into a **Socratic debugging assistant**. Instead of handing you the fix, the duck asks you one question at a time and guides you to find the answer yourself.

> Named after [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging) — the practice of explaining your problem aloud to an inanimate duck until the solution becomes obvious. This skill is that duck, except it asks questions back.

## Philosophy

The fastest way to fix a bug is often to be asked the right question. When someone hands you the answer, you fix the bug but learn nothing — and you stay dependent. When you're guided to the answer, you fix the bug *and* sharpen the instincts that prevent the next ten.

The Rubber Duck skill is built on one rule: **it never gives you the solution.** Not even if you ask. It's a tool for your thinking, not a replacement for it. The reward is that the insight is genuinely yours.

## How it works

The duck guides every debugging session through three phases:

| Phase | Goal | What the duck does |
|-------|------|--------------------|
| `[🦆 LOCATE]` | Find **where** the problem is | Asks questions that make you trace the flow and observe instead of assume |
| `[🦆 UNDERSTAND]` | Find **why** it happens | Probes your mental model to find where it disagrees with reality |
| `[🦆 SOLVE]` | Pressure-test your fix | You propose a solution; the duck gives ONE drawback; you refine; repeat |

### The rules the duck follows

- **Won't hand you the fix for casual pleading** — but if you *deliberately* tell it to step out and just give the answer, it will, after warning you the insight won't stick the same way.
- **One question (or one critique) per response.** No walls of text, no stacked questions.
- **Won't skip ahead — and won't cling either.** It stays in a phase until that phase is genuinely resolved, and drops back if later evidence shows it took a wrong turn.
- **Does its homework first.** It reads the ticket/context, forms a few *private, competing* hypotheses about where the bug might be, then asks for *your* read before steering — and never reveals its guesses or lets one tunnel-vision the questions.
- **Adapts to your context.** Vague problem → broad locating questions. Detailed problem with logs → it jumps closer to the root cause.
- **Unblocks you when you're stuck.** Stuck for 2+ exchanges? It gives a small hint to shrink the search space — never the answer.
- **Ends on reality, not argument.** When your fix holds up on paper, it sends you to run it and confirm — done means verified.
- **Always shows the current phase** at the start of each reply.

## Installation

This is a personal (user-level) Claude Code skill. Place the skill folder where Claude Code looks for skills:

**macOS / Linux**
```bash
mkdir -p ~/.claude/skills/rubber-duck
cp SKILL.md ~/.claude/skills/rubber-duck/
```

**Windows (PowerShell)**
```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills\rubber-duck"
Copy-Item SKILL.md "$env:USERPROFILE\.claude\skills\rubber-duck\"
```

To make it project-specific instead, copy the folder into `.claude/skills/rubber-duck/` inside your repository.

Only `SKILL.md` is required for the skill to work — this `README.md` is documentation for humans.

## Usage

Start any message with `@rubber-duck` and describe what's going wrong:

```
@rubber-duck my API call returns 200 but the data doesn't update in the UI
```

You can also point it at a tracked task and let it gather context itself:

```
@rubber-duck help me solve ES-1234 — use Atlassian MCP to pull the ticket
```

When you do, the duck reads the ticket first, forms a few private hypotheses about where the bug might be, then opens by asking for *your* read — it never dumps its own guesses.

The duck takes it from there — one question at a time. Answer honestly (especially "I haven't checked that yet"), follow where the questions lead, and you'll usually find the bug before the duck would have been able to tell you anyway.

## Example

For a short annotated dialogue, see the **Worked Example** at the end of [`SKILL.md`](./SKILL.md).

## Why a duck?

Because the duck doesn't judge. It doesn't get tired of your questions. And when you finally say "oh — *oh*, I see it now," the duck was right there with you the whole time, having said almost nothing. That's the job.
