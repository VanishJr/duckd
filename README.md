# junie-skills 🎓

A growing collection of **Claude Code skills for junior developers** ("junies").

The skills here share one philosophy: they help juniors *grow*, not just ship.
Where most AI tooling hands over the finished answer, these skills are built to
teach the instincts behind the answer — so the next bug, review, or design
decision is one the developer can handle on their own.

This is a personal, evolving collection. Skills get added as ideas come up.

## Skills

| Skill | What it does | Status |
|-------|--------------|--------|
| [🦆 rubber-duck](./rubber-duck) | A Socratic debugging companion that guides you to the bug with one question at a time and **never hands over the fix**. | Prototype — in testing |

> More skills will land here over time. Each lives in its own top-level folder.

## How a skill is structured

Every skill is a self-contained folder:

```
<skill-name>/
├── SKILL.md      # the skill itself — the only file Claude Code needs
└── README.md     # human-facing docs for that skill
```

Only `SKILL.md` is required for a skill to run. The `README.md` is
documentation for people.

## Installing a skill

These are user-level Claude Code skills. Drop the skill's folder where Claude
Code looks for skills:

**macOS / Linux**
```bash
cp -r rubber-duck ~/.claude/skills/
```

**Windows (PowerShell)**
```powershell
Copy-Item -Recurse rubber-duck "$env:USERPROFILE\.claude\skills\"
```

To scope a skill to a single project instead, copy its folder into
`.claude/skills/` inside that repository.

See each skill's own README for activation and usage details.

## Adding a new skill

1. Create a new top-level folder named after the skill.
2. Add a `SKILL.md` with frontmatter (`name`, `description`) and the skill's instructions.
3. Add a `README.md` explaining what it does and how to use it.
4. Add a row to the **Skills** table above.

## Why "junie"?

Because the audience is junior developers — and the goal is to give them skills
that make them less junior every time they use one.
