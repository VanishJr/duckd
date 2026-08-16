/**
 * Commit conventions from the Commits section of AGENTS.md.
 *
 * Enforcement is CI only. There is deliberately no husky or lefthook: a local
 * hook can be skipped with --no-verify and drifts between machines.
 *
 * Two rules in AGENTS.md are not machine checkable and stay review concerns:
 * imperative mood, and one logical change per commit.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'ci', 'build']],
    // config-conventional allows an empty scope. AGENTS.md documents the form as
    // `type(scope): subject`, so the scope is required here.
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      ['core', 'mcp', 'cli', 'code-context', 'hooks', 'adapters', 'evals', 'docs', 'repo'],
    ],
    // Rejects a capitalised first word without rejecting MCP, TypeScript or any
    // other proper noun later in the subject. A strict 'lower-case' check would
    // fail `fix(mcp): drop stale MCP session on transport close`.
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 60],
  },
}
