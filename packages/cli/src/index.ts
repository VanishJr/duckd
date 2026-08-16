/**
 * @duckd/cli: the duck without an editor.
 *
 * The CLI is not a convenience wrapper; it is the reference client. If a debugging
 * session works here, over plain stdin/stdout and the same `@duckd/core` engine,
 * then every editor adapter is a rendering problem rather than a behaviour problem.
 */

export interface CommandSpec {
  readonly name: string
  readonly summary: string
}

export const COMMANDS: readonly CommandSpec[] = [
  { name: 'start', summary: 'Open a duck session in the terminal and debug interactively.' },
  { name: 'sessions', summary: 'List, inspect and resume past sessions.' },
  { name: 'export', summary: 'Write a session out as Markdown or JSON.' },
  {
    name: 'adapters',
    summary: 'Regenerate host artifacts from the spec, or check them for drift.',
  },
]

// TODO(cli): wire the commands above onto commander in ./bin.ts.
