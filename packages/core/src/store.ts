import type { Session, SessionId } from './session.js'

/**
 * Sessions outlive a single process: the MCP server, the CLI and the Claude Code
 * hooks all read and write the same session. The store is an interface so that
 * swapping the file-backed default for SQLite is not a rewrite.
 */
export interface SessionStore {
  get(id: SessionId): Promise<Session | undefined>
  put(session: Session): Promise<void>
  list(): Promise<readonly Session[]>
  delete(id: SessionId): Promise<boolean>
}

/** Volatile store: the default for tests and for `duckd start --ephemeral`. */
export class InMemorySessionStore implements SessionStore {
  readonly #sessions = new Map<SessionId, Session>()

  async get(id: SessionId): Promise<Session | undefined> {
    return this.#sessions.get(id)
  }

  async put(session: Session): Promise<void> {
    this.#sessions.set(session.id, session)
  }

  async list(): Promise<readonly Session[]> {
    return [...this.#sessions.values()]
  }

  async delete(id: SessionId): Promise<boolean> {
    return this.#sessions.delete(id)
  }
}

// TODO(store): FileSessionStore under `~/.duckd/sessions/`, the default for real runs.
