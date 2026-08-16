# duckd 🦆

A **Socratic debugging companion**. Instead of handing you the fix, the duck asks
you one question at a time and guides you to find the answer yourself.

> Named after [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging) —
> the practice of explaining your problem aloud to an inanimate duck until the
> solution becomes obvious. This is that duck, except it asks questions back.

## Philosophy

The fastest way to fix a bug is often to be asked the right question. When someone
hands you the answer, you fix the bug but learn nothing — and you stay dependent.
When you're guided to the answer, you fix the bug *and* sharpen the instincts that
prevent the next ten.

The duck is built on one rule: **it never gives you the solution.** Not even if you
ask. It's a tool for your thinking, not a replacement for it. The reward is that the
insight is genuinely yours.

## How it works

Every debugging session moves through three phases:

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

## Worked example

> **You:** @duck my API call returns 200 but the data doesn't update in the UI
>
> **Duck [🦆 LOCATE]:** Where in the flow do you first expect to see the data update — right after the API call returns, or after some state change downstream?
>
> **You:** after the state change I think
>
> **Duck [🦆 LOCATE]:** What does your state actually look like the moment the API call completes — have you logged it to confirm?
>
> **You:** oh I see, the state updates but the component doesn't re-render
>
> **Duck [🦆 UNDERSTAND]:** What is it that tells your framework a component needs to re-render?

Notice: one question per turn, the phase tag every time, and the duck never says
"you forgot to use a state setter" — it lets you arrive there.

## The spec is the source of truth

The duck's behaviour lives in one normative document:

**[`docs/spec/socratic-protocol.md`](./docs/spec/socratic-protocol.md)**

The engine and every generated adapter (Claude Code, Cursor, Copilot, Junie) are
derived from that file. Behaviour changes go there first, then get regenerated —
adapters are never edited by hand.

## Repository layout

```
docs/
├── spec/socratic-protocol.md   # normative behaviour — the source of truth
├── adr/                        # architecture decision records
└── architecture.md             # how the packages fit together
packages/
├── core/                       # state machine, session store, providers, hint ladder
├── mcp/                        # MCP server over core (stdio + streamable HTTP)
├── cli/                        # duckd start / sessions / export / adapters
├── code-context/               # git diff & blame, tree-sitter, later LSP
├── hooks/                      # Claude Code PreToolUse / Stop guards
├── adapters/                   # generates AGENTS.md, .cursor/rules, .github/skills
└── evals/                      # socratic-debugging-benchmark runs
examples/
└── claude-code/                # installable plugin bundle: skill + hooks + MCP config
```

Dependencies point inward at `core`, which depends on nothing else in the workspace.
[`docs/architecture.md`](./docs/architecture.md) explains why.

## Development

Requires Node 24 (see `.nvmrc`) and pnpm — `corepack enable pnpm` picks up the pinned
version from `package.json`.

```bash
pnpm install
pnpm check      # biome + tsc -b + vitest, the same gate CI runs
```

| Script | Does |
|--------|------|
| `pnpm build` | `tsc -b` across the project-reference graph |
| `pnpm test` | Vitest |
| `pnpm lint` | Biome lint + format check |
| `pnpm format` | Biome, writing fixes |

## Status

Early, and honest about it: the spec is written and the skeleton builds green, but the
engine, the MCP server and the generated adapters are stubs. Every unimplemented piece is
marked with a `TODO` naming the package that owns it. Installation instructions land with
the adapters — see [ROADMAP.md](./ROADMAP.md).

## License

[MIT](./LICENSE)
