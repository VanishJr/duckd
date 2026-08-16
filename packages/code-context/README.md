# @duckd/code-context

Gives the duck something concrete to ask about: what changed, who changed it, and
how the file is structured.

## Design constraint

This package returns **observations, not conclusions**. A `DiffHunk` and a `BlameEntry`
are things the developer can be pointed at and asked to read. A summary like
*"the bug is probably in the retry logic"* would be the duck doing the work — that
is exactly what the protocol forbids, so it is not a shape this package can return.

## Planned layers

1. **git** — `diff` and `blame`. Cheapest signal, no parsing, works everywhere.
2. **tree-sitter** — structural symbols without a running language server.
3. **LSP** — definitions and references. Last, because it needs a live server per language.
