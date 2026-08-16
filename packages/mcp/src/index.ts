/**
 * @duckd/mcp: exposes the engine as an MCP server.
 *
 * Transports:
 *  - **stdio** for editor-launched servers (Claude Code, Cursor, Junie).
 *  - **streamable HTTP** for a shared/remote duck, where several clients talk to
 *    one session store.
 *
 * The tool surface is intentionally narrow. The duck's value is a constraint (it
 * withholds the answer), and every extra tool is another way for a host agent to
 * route around that constraint.
 */

export const TOOL_NAMES = {
  startSession: 'duck_start_session',
  respond: 'duck_respond',
  getSession: 'duck_get_session',
  endSession: 'duck_end_session',
} as const

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES]

export type TransportKind = 'stdio' | 'http'

export interface ServerOptions {
  readonly transport: TransportKind
  /** HTTP transport only. */
  readonly port?: number
  /** Defaults to a file-backed store under `~/.duckd`. */
  readonly sessionDir?: string
}

// TODO(server): createDuckServer(options) -> McpServer wired to @duckd/core.
// TODO(schemas): zod input schemas per tool, shared with the CLI.
// TODO(transport): stdio + StreamableHTTPServerTransport, session id propagation.
