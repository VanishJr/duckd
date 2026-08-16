/**
 * @duckd/hooks — enforcement, not persuasion.
 *
 * A prompt that says "never write the fix" is a request. A `PreToolUse` hook that
 * denies `Edit` while a duck session is open is a guarantee. The protocol's Prime
 * Directive is the one property worth spending a hard mechanism on, because a host
 * agent that edits the file has already ended the learning, whatever the prompt said.
 */

/** Subset of the Claude Code hook payload the guards actually read. */
export interface PreToolUseInput {
  readonly session_id: string
  readonly cwd: string
  readonly tool_name: string
  readonly tool_input: Record<string, unknown>
}

export interface StopInput {
  readonly session_id: string
  readonly cwd: string
  readonly stop_hook_active: boolean
}

export type HookDecision =
  | { readonly decision: 'allow' }
  | { readonly decision: 'deny'; readonly reason: string }
  | { readonly decision: 'block'; readonly reason: string }

/** Tools that would let the agent apply the fix instead of asking about it. */
export const MUTATING_TOOLS = ['Edit', 'Write', 'NotebookEdit', 'MultiEdit'] as const

// TODO(guard): PreToolUse — deny MUTATING_TOOLS while a duck session is open and
// the developer has not taken the off-ramp.
// TODO(guard): Stop — block the turn if the last assistant message has no phase tag
// or stacks more than one question, per Strict Rules 2 and 6.
