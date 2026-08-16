# Architecture Decision Records

Each ADR records **one** decision: the context that forced it, the options that
were on the table, what was chosen, and what that costs. ADRs are append-only —
a decision that turns out wrong is not edited, it is superseded by a new ADR and
marked `Superseded by ADR-NNNN`.

## Conventions

- One file per decision: `NNNN-kebab-case-title.md`, numbered sequentially from `0001`.
- Copy [`0000-template.md`](./0000-template.md) to start a new one.
- `Status` is one of: `Proposed`, `Accepted`, `Superseded by ADR-NNNN`, `Deprecated`.
- Write the ADR *before* the code it justifies, while the alternatives are still live options.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](./0001-typescript-monorepo.md) | TypeScript monorepo on pnpm workspaces | Accepted |
| [0002](./0002-llm-provider-not-mcp-sampling.md) | Model access through `LlmProvider`, not MCP sampling | Accepted |
