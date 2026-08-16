# @duckd/mcp

The engine, spoken as MCP.

## Transports

- **stdio** — the editor spawns the server as a child process. Default for Claude Code, Cursor and Junie.
- **streamable HTTP** — one duck, many clients, shared session store.

## Tool surface

| Tool | Purpose |
|------|---------|
| `duck_start_session` | Open a session from a problem statement and optional repo context |
| `duck_respond` | Submit the developer's answer, receive the next single question |
| `duck_get_session` | Read phase, turn history and hint level |
| `duck_end_session` | Close a session as verified or abandoned |

The surface is kept small on purpose. Each additional tool is another path by which
a host agent could extract the answer the duck exists to withhold.
