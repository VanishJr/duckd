/**
 * @duckd/code-context: turns a repository into evidence the duck can ask about.
 *
 * The duck must never *state* what the code does; it asks questions that make the
 * developer look. So this package deliberately returns raw, citable observations
 * (a diff hunk, a blame line, a symbol range) rather than summaries or diagnoses.
 */

export interface FileRange {
  readonly path: string
  readonly startLine: number
  readonly endLine: number
}

export interface DiffHunk extends FileRange {
  readonly patch: string
}

export interface BlameEntry extends FileRange {
  readonly commit: string
  readonly author: string
  readonly at: string
  readonly summary: string
}

export interface SymbolRef extends FileRange {
  readonly name: string
  readonly kind: 'function' | 'class' | 'method' | 'variable' | 'type'
}

/** What the duck is handed before its Preparation step. */
export interface RepoContext {
  readonly root: string
  readonly changed: readonly DiffHunk[]
  readonly symbols: readonly SymbolRef[]
}

export interface CodeContextProvider {
  /** Uncommitted or since-base changes, usually the highest-signal starting point. */
  diff(options?: { readonly base?: string }): Promise<readonly DiffHunk[]>
  blame(range: FileRange): Promise<readonly BlameEntry[]>
  /** Structural outline via tree-sitter; language-agnostic by design. */
  symbols(path: string): Promise<readonly SymbolRef[]>
}

// TODO(git): GitCodeContext backed by `git diff` / `git blame --porcelain`.
// TODO(tree-sitter): symbol extraction, so `symbols()` works without a language server.
// TODO(lsp): optional LSP client for go-to-definition and references. Strictly later.
// See the architecture doc on why tree-sitter comes first.
